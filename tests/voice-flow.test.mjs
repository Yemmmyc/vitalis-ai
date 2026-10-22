import test from "node:test";
import assert from "node:assert/strict";

test("Voice Flow & Assistant Latency Optimization Suite", async (t) => {
  // 1. Non-blocking response refresh and fetch coalescing
  await t.test("handleSendMessage returns spokenResponse without waiting for background sync", async () => {
    let backgroundSyncStarted = false;
    let backgroundSyncCompleted = false;

    // Simulated service with 50ms sync delay
    const mockService = {
      async sendMessage(msg) {
        return {
          spokenResponse: `Response to: ${msg}`,
          toolExecutions: [{ tool: "check_medication_schedule" }]
        };
      },
      async fetchData() {
        backgroundSyncStarted = true;
        await new Promise((resolve) => setTimeout(resolve, 50));
        backgroundSyncCompleted = true;
      }
    };

    // Handler implementing non-blocking background sync pattern from App.tsx
    const handleSendMessage = async (msg) => {
      const res = await mockService.sendMessage(msg);
      // Background sync triggered without await
      mockService.fetchData().catch(() => {});
      return {
        spokenResponse: res.spokenResponse,
        toolExecutions: res.toolExecutions || []
      };
    };

    const startTime = Date.now();
    const result = await handleSendMessage("What pills do I need to take today?");
    const elapsed = Date.now() - startTime;

    // Response must be returned immediately before background sync finishes
    assert.equal(result.spokenResponse, "Response to: What pills do I need to take today?");
    assert.equal(backgroundSyncStarted, true);
    assert.equal(backgroundSyncCompleted, false, "Response should return before background sync finishes");
    assert.ok(elapsed < 40, `Response returned in ${elapsed}ms without waiting for background sync`);

    // Allow background task to complete cleanly
    await new Promise((resolve) => setTimeout(resolve, 60));
    assert.equal(backgroundSyncCompleted, true);
  });

  await t.test("Background sync rejection does not cause unhandled promise rejection", async () => {
    let rejectionHandled = false;

    const mockService = {
      async sendMessage() {
        return { spokenResponse: "All good", toolExecutions: [] };
      },
      async fetchData() {
        throw new Error("Network timeout during state refresh");
      }
    };

    const handleSendMessage = async () => {
      const res = await mockService.sendMessage();
      mockService.fetchData().catch((err) => {
        rejectionHandled = true;
        assert.ok(err.message.includes("Network timeout"));
      });
      return res;
    };

    const res = await handleSendMessage();
    assert.equal(res.spokenResponse, "All good");

    // Allow microtasks to process
    await new Promise((resolve) => setTimeout(resolve, 10));
    assert.equal(rejectionHandled, true, "Rejected promise was safely caught");
  });

  await t.test("Concurrent fetchData calls coalesce without flooding network", async () => {
    let executionCount = 0;
    let isFetching = false;
    let pendingFetch = false;

    const coalescedFetchData = async () => {
      if (isFetching) {
        pendingFetch = true;
        return;
      }
      isFetching = true;
      try {
        executionCount++;
        await new Promise((resolve) => setTimeout(resolve, 20));
      } finally {
        isFetching = false;
        if (pendingFetch) {
          pendingFetch = false;
          coalescedFetchData();
        }
      }
    };

    // Trigger 5 concurrent fetch requests (e.g. from chat, SSE agent:turn, and tool execution)
    await Promise.all([
      coalescedFetchData(),
      coalescedFetchData(),
      coalescedFetchData(),
      coalescedFetchData(),
      coalescedFetchData()
    ]);

    // Give queued coalesced execution time to complete
    await new Promise((resolve) => setTimeout(resolve, 40));

    // Must execute at most 2 times (initial batch + single coalesced follow-up), never 5 times
    assert.ok(executionCount <= 2, `Expected <= 2 executions but got ${executionCount}`);
  });

  // 2. Utterance reference lifecycle and queue management
  await t.test("Active utterance reference is retained until speech completes", async () => {
    let activeUtteranceRef = null;
    let isSpeaking = false;

    class MockSpeechUtterance {
      constructor(text) {
        this.text = text;
        this.onstart = null;
        this.onend = null;
        this.onerror = null;
      }
    }

    const speak = (text) => {
      // Clear previous utterance if active
      if (activeUtteranceRef) {
        activeUtteranceRef.onstart = null;
        activeUtteranceRef.onend = null;
        activeUtteranceRef.onerror = null;
        activeUtteranceRef = null;
      }

      const utterance = new MockSpeechUtterance(text);
      activeUtteranceRef = utterance;

      utterance.onstart = () => {
        isSpeaking = true;
      };
      utterance.onend = () => {
        if (activeUtteranceRef === utterance) {
          activeUtteranceRef = null;
        }
        isSpeaking = false;
      };

      utterance.onstart();
      return utterance;
    };

    // Start speech 1
    const u1 = speak("Good morning Eleanor");
    assert.equal(isSpeaking, true);
    assert.equal(activeUtteranceRef, u1, "Active utterance must be held in reference");

    // Complete speech 1
    u1.onend();
    assert.equal(isSpeaking, false);
    assert.equal(activeUtteranceRef, null, "Reference must be cleared on completion");

    // Start speech 2 and interrupt with speech 3
    const u2 = speak("First message");
    assert.equal(activeUtteranceRef, u2);

    const u3 = speak("Second interrupting message");
    assert.equal(activeUtteranceRef, u3, "Reference must update to newest utterance");
    assert.equal(u2.onend, null, "Interrupted utterance handlers must be detached");

    u3.onend();
    assert.equal(activeUtteranceRef, null);
    assert.equal(isSpeaking, false);
  });

  // 3. Speech recognition error mapping and feedback
  await t.test("Speech recognition errors map to safe, informative user feedback", () => {
    const mapRecognitionError = (errType) => {
      if (errType === 'no-speech') {
        return "No speech detected. Tap the mic or choose a quick prompt to try again.";
      } else if (errType === 'not-allowed' || errType === 'permission-denied') {
        return "Microphone permission was not allowed. You can type your request or check browser permissions.";
      } else if (errType === 'network') {
        return "Voice network connection issue. You can try speaking again or use text input.";
      } else if (errType === 'aborted') {
        return null;
      }
      return "Voice recognition stopped. You can tap the mic again or type your message below.";
    };

    assert.equal(
      mapRecognitionError('no-speech'),
      "No speech detected. Tap the mic or choose a quick prompt to try again."
    );
    assert.equal(
      mapRecognitionError('not-allowed'),
      "Microphone permission was not allowed. You can type your request or check browser permissions."
    );
    assert.equal(
      mapRecognitionError('network'),
      "Voice network connection issue. You can try speaking again or use text input."
    );
    assert.equal(mapRecognitionError('aborted'), null, "Aborted error should not show an error banner");
    assert.ok(mapRecognitionError('unknown-error').includes("type your message below"));
  });

  // 4. Per-utterance lifecycle, submission guards, and race protection
  await t.test("Auto-submits pending interim transcript on recognition onend when isFinal is omitted", async () => {
    let submittedText = null;
    let submitCount = 0;

    const hasSubmittedRef = { current: false };
    const isSubmittingRef = { current: false };
    const sessionTextRef = { current: '' };

    const handleSend = async (text) => {
      if (!text || isSubmittingRef.current) return;
      isSubmittingRef.current = true;
      hasSubmittedRef.current = true;
      submitCount++;
      submittedText = text;
      isSubmittingRef.current = false;
    };

    // User speaks, only interim transcript arrives
    sessionTextRef.current = "Did I take my morning pills";

    // Recognition ends naturally without an explicit isFinal event
    const onend = () => {
      const pending = sessionTextRef.current.trim();
      sessionTextRef.current = '';
      if (pending && !hasSubmittedRef.current && !isSubmittingRef.current) {
        handleSend(pending);
      }
    };

    onend();

    assert.equal(submittedText, "Did I take my morning pills");
    assert.equal(submitCount, 1);
    assert.equal(hasSubmittedRef.current, true);
    assert.equal(sessionTextRef.current, "");
  });

  await t.test("Submits final transcript immediately via onresult", async () => {
    let submittedText = null;
    let submitCount = 0;

    const hasSubmittedRef = { current: false };
    const isSubmittingRef = { current: false };
    const sessionTextRef = { current: '' };

    const handleSend = async (text) => {
      if (!text || isSubmittingRef.current) return;
      isSubmittingRef.current = true;
      hasSubmittedRef.current = true;
      submitCount++;
      submittedText = text;
      isSubmittingRef.current = false;
    };

    const onresult = (finalTranscript) => {
      const trimmed = finalTranscript.trim();
      sessionTextRef.current = trimmed;
      if (!hasSubmittedRef.current && !isSubmittingRef.current && trimmed) {
        handleSend(trimmed);
      }
    };

    onresult("What pills do I need to take today?");

    assert.equal(submittedText, "What pills do I need to take today?");
    assert.equal(submitCount, 1);
    assert.equal(hasSubmittedRef.current, true);
  });

  await t.test("Manual-stop (toggleMic) and final onresult race condition submits exactly once", async () => {
    let sendCalls = 0;
    const hasSubmittedRef = { current: false };
    const isSubmittingRef = { current: false };
    const sessionTextRef = { current: '' };

    const handleSend = async (text) => {
      const query = (text || '').trim();
      if (!query || isSubmittingRef.current) return;

      isSubmittingRef.current = true;
      hasSubmittedRef.current = true;
      sessionTextRef.current = '';
      sendCalls++;

      // Simulate async network request
      await new Promise((resolve) => setTimeout(resolve, 20));
      isSubmittingRef.current = false;
    };

    // Simulate final result arriving
    sessionTextRef.current = "Check blood pressure";
    const onresultPromise = (async () => {
      if (!hasSubmittedRef.current && !isSubmittingRef.current) {
        await handleSend(sessionTextRef.current);
      }
    })();

    // Concurrently at the same instant, user taps microphone to finish
    const manualStopPromise = (async () => {
      const pending = sessionTextRef.current.trim();
      sessionTextRef.current = '';
      if (pending && !hasSubmittedRef.current && !isSubmittingRef.current) {
        await handleSend(pending);
      }
    })();

    await Promise.all([onresultPromise, manualStopPromise]);

    assert.equal(sendCalls, 1, "Guards must prevent concurrent duplicate submission of the same utterance");
  });

  await t.test("Starting a new session resets per-utterance state and prevents stale text submission", async () => {
    let submittedText = null;
    const hasSubmittedRef = { current: true }; // from previous session
    const sessionTextRef = { current: 'Old stale text from previous session' };

    const handleSend = (text) => {
      submittedText = text;
    };

    // Start new session
    const startNewSession = () => {
      hasSubmittedRef.current = false;
      sessionTextRef.current = '';
    };

    startNewSession();

    assert.equal(hasSubmittedRef.current, false);
    assert.equal(sessionTextRef.current, '');

    // If onend fires with empty session, nothing should be submitted
    const onend = () => {
      const pending = sessionTextRef.current.trim();
      sessionTextRef.current = '';
      if (pending && !hasSubmittedRef.current) {
        handleSend(pending);
      }
    };

    onend();
    assert.equal(submittedText, null, "Stale text from prior session must not be submitted");
  });

  await t.test("Recognition errors and InvalidStateError cleanly reset listening state without hanging", () => {
    let isListening = true;
    let isRecognizingSpeech = true;
    const sessionTextRef = { current: 'Partial aborted audio' };

    const handleRecognitionError = (errType) => {
      isListening = false;
      isRecognizingSpeech = false;
      if (errType === 'no-speech' || errType === 'not-allowed') {
        sessionTextRef.current = '';
      }
    };

    handleRecognitionError('no-speech');
    assert.equal(isListening, false);
    assert.equal(isRecognizingSpeech, false);
    assert.equal(sessionTextRef.current, '');

    // InvalidStateError on start
    let startErrorHandled = false;
    const handleStart = () => {
      try {
        throw new Error("InvalidStateError: recognition has already started");
      } catch (e) {
        isListening = false;
        isRecognizingSpeech = false;
        startErrorHandled = true;
      }
    };

    handleStart();
    assert.equal(startErrorHandled, true);
    assert.equal(isListening, false);
  });

  await t.test("Transcript assembly correctly combines multi-result events without dropping earlier chunks", () => {
    const assembleTranscript = (results) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = 0; i < results.length; ++i) {
        const res = results[i];
        if (res.isFinal) {
          finalTranscript += res[0].transcript;
        } else {
          interimTranscript += res[0].transcript;
        }
      }
      let combined = finalTranscript;
      if (finalTranscript && interimTranscript && !finalTranscript.endsWith(' ') && !interimTranscript.startsWith(' ')) {
        combined += ' ';
      }
      combined += interimTranscript;
      return {
        combined: combined.trim(),
        finalText: finalTranscript.trim(),
        interimText: interimTranscript.trim()
      };
    };

    // Event 1: First chunk is final, second chunk is interim
    const event1Results = [
      [{ transcript: "What pills " }],
      [{ transcript: "do I need" }]
    ];
    event1Results[0].isFinal = true;
    event1Results[1].isFinal = false;

    const t1 = assembleTranscript(event1Results);
    assert.equal(t1.combined, "What pills do I need");
    assert.equal(t1.finalText, "What pills");
    assert.equal(t1.interimText, "do I need");

    // Event 2: Both chunks finalized plus third interim chunk added
    const event2Results = [
      [{ transcript: "What pills " }],
      [{ transcript: "do I need " }],
      [{ transcript: "today" }]
    ];
    event2Results[0].isFinal = true;
    event2Results[1].isFinal = true;
    event2Results[2].isFinal = false;

    const t2 = assembleTranscript(event2Results);
    assert.equal(t2.combined, "What pills do I need today");
    assert.equal(t2.finalText, "What pills do I need");
    assert.equal(t2.interimText, "today");
  });

  await t.test("No-speech error preserves usable interim transcript and allows onend submission", async () => {
    let submittedText = null;
    let voiceNotice = null;
    let isListening = true;
    let isRecognizingSpeech = true;
    const hasSubmittedRef = { current: false };
    const sessionTextRef = { current: 'I am feeling dizzy' };

    const handleSend = (text) => {
      submittedText = text;
      hasSubmittedRef.current = true;
    };

    // onerror fires with 'no-speech'
    const onerror = (errType) => {
      if (errType === 'no-speech') {
        if (!sessionTextRef.current.trim()) {
          voiceNotice = "No speech detected. Tap the mic or choose a quick prompt to try again.";
        }
        isListening = false;
        isRecognizingSpeech = false;
      }
    };

    onerror('no-speech');

    // Usable transcript was NOT wiped and notice is NOT shown
    assert.equal(sessionTextRef.current, 'I am feeling dizzy');
    assert.equal(voiceNotice, null);
    assert.equal(isListening, false);
    assert.equal(isRecognizingSpeech, false);

    // Immediate onend follows
    const onend = () => {
      const pending = sessionTextRef.current.trim();
      sessionTextRef.current = '';
      if (pending && !hasSubmittedRef.current) {
        handleSend(pending);
      }
    };

    onend();
    assert.equal(submittedText, 'I am feeling dizzy');
    assert.equal(hasSubmittedRef.current, true);
    assert.equal(sessionTextRef.current, '');
  });

  await t.test("Permission-denied prevents onend auto-submission and displays clear notice", async () => {
    let submittedText = null;
    let voiceNotice = null;
    let isListening = true;
    let isRecognizingSpeech = true;
    const hasSubmittedRef = { current: false };
    const sessionTextRef = { current: 'Stale residual text' };

    const handleSend = (text) => {
      submittedText = text;
    };

    const onerror = (errType) => {
      if (errType === 'not-allowed' || errType === 'permission-denied') {
        hasSubmittedRef.current = true;
        sessionTextRef.current = '';
        isListening = false;
        isRecognizingSpeech = false;
        voiceNotice = "Microphone permission was not allowed. You can type your request or check browser permissions.";
      }
    };

    onerror('not-allowed');

    assert.equal(hasSubmittedRef.current, true);
    assert.equal(sessionTextRef.current, '');
    assert.equal(isListening, false);
    assert.ok(voiceNotice.includes("Microphone permission was not allowed"));

    // onend follows onerror
    const onend = () => {
      const pending = sessionTextRef.current.trim();
      sessionTextRef.current = '';
      if (pending && !hasSubmittedRef.current) {
        handleSend(pending);
      }
    };

    onend();
    assert.equal(submittedText, null, "Permission denied must never auto-submit text");
  });

  await t.test("Manual stop followed by late onresult and onend results in exactly one submission", async () => {
    let submitCount = 0;
    let submittedText = null;
    const hasSubmittedRef = { current: false };
    const sessionTextRef = { current: 'Check my pills' };

    const handleSend = (text) => {
      submitCount++;
      submittedText = text;
    };

    // User taps mic while listening
    const toggleMicStop = () => {
      const pending = sessionTextRef.current.trim();
      sessionTextRef.current = '';
      if (pending && !hasSubmittedRef.current) {
        hasSubmittedRef.current = true;
        handleSend(pending);
      } else {
        hasSubmittedRef.current = true;
      }
    };

    toggleMicStop();
    assert.equal(submitCount, 1);
    assert.equal(submittedText, 'Check my pills');
    assert.equal(hasSubmittedRef.current, true);

    // Delayed late onresult fires with final transcript
    const lateOnResult = (text) => {
      if (!hasSubmittedRef.current) {
        hasSubmittedRef.current = true;
        handleSend(text);
      }
    };
    lateOnResult('Check my pills');

    // Delayed late onend fires
    const lateOnEnd = () => {
      const pending = sessionTextRef.current.trim();
      sessionTextRef.current = '';
      if (pending && !hasSubmittedRef.current) {
        hasSubmittedRef.current = true;
        handleSend(pending);
      }
    };
    lateOnEnd();

    assert.equal(submitCount, 1, "Must not resubmit when manual stop already submitted");
  });

  await t.test("Session ID tracking rejects events from superseded recognition sessions", async () => {
    let currentSessionId = 1;
    let submittedText = null;
    let submitCount = 0;
    const hasSubmittedRef = { current: false };
    const sessionTextRef = { current: '' };

    const handleSend = (text) => {
      submitCount++;
      submittedText = text;
      hasSubmittedRef.current = true;
    };

    // User starts new session 2
    currentSessionId = 2;
    hasSubmittedRef.current = false;
    sessionTextRef.current = '';

    // Old callback from session 1 arrives
    const onresultFromSession = (sessionId, text) => {
      if (sessionId !== currentSessionId || hasSubmittedRef.current) {
        return;
      }
      handleSend(text);
    };

    onresultFromSession(1, "Old speech from session 1");
    assert.equal(submitCount, 0, "Event from older session must be discarded");

    // Event from current session 2 arrives
    onresultFromSession(2, "New speech from session 2");
    assert.equal(submitCount, 1, "Event from active session must be accepted");
    assert.equal(submittedText, "New speech from session 2");
  });

  // 5. Client Request Timeout & AbortController Handling
  await t.test("Client request timeout aborts request and marks error as timeout after deadline", async () => {
    let timeoutCleanedUp = false;
    const TEST_TIMEOUT_MS = 30;

    const sendMessageWithTimeout = async () => {
      const controller = new AbortController();
      let isTimedOut = false;
      const timeoutId = setTimeout(() => {
        isTimedOut = true;
        controller.abort();
      }, TEST_TIMEOUT_MS);

      try {
        // Simulated hanging request
        await new Promise((resolve, reject) => {
          controller.signal.addEventListener("abort", () => {
            const err = new Error("The operation was aborted");
            err.name = "AbortError";
            reject(err);
          });
        });
      } catch (err) {
        if (isTimedOut || err?.name === 'AbortError') {
          const timeoutErr = new Error("Request timed out");
          timeoutErr.isTimeout = true;
          throw timeoutErr;
        }
        throw err;
      } finally {
        clearTimeout(timeoutId);
        timeoutCleanedUp = true;
      }
    };

    await assert.rejects(
      async () => sendMessageWithTimeout(),
      (err) => {
        assert.equal(err.isTimeout, true);
        assert.ok(err.message.includes("timed out"));
        return true;
      }
    );

    assert.equal(timeoutCleanedUp, true, "Timeout timer must be cleared in finally");
  });

  await t.test("Client fetch distinguishes network failure from timeout", async () => {
    const classifyError = (err, isTimedOut) => {
      if (isTimedOut || err?.name === 'AbortError') {
        return { type: 'timeout', message: 'Cloud service took too long to respond.' };
      }
      if (err instanceof TypeError && err.message.toLowerCase().includes('fetch')) {
        return { type: 'network', message: 'Network connection issue.' };
      }
      return { type: 'general', message: 'General error.' };
    };

    const networkErr = new TypeError("Failed to fetch");
    const netResult = classifyError(networkErr, false);
    assert.equal(netResult.type, 'network');

    const abortErr = new Error("The operation was aborted");
    abortErr.name = "AbortError";
    const timeoutResult = classifyError(abortErr, true);
    assert.equal(timeoutResult.type, 'timeout');
  });

  // 6. Bedrock Timeout Fallback with AbortSignal
  await t.test("Bedrock timeout cancels request and falls back to simulated response cleanly", async () => {
    const BEDROCK_TIMEOUT_MS = 25;
    let abortCalled = false;
    let timerCleanedUp = false;

    const simulateBedrockResponse = (prompt) => {
      return `Simulated response to: ${prompt}`;
    };

    const generateResponse = async (prompt) => {
      const abortController = new AbortController();
      let isTimedOut = false;
      const timeoutId = setTimeout(() => {
        isTimedOut = true;
        abortController.abort();
      }, BEDROCK_TIMEOUT_MS);

      try {
        // Simulated slow AWS Bedrock request that takes 100ms
        await new Promise((resolve, reject) => {
          abortController.signal.addEventListener("abort", () => {
            abortCalled = true;
            const err = new Error("Request aborted");
            err.name = "AbortError";
            reject(err);
          });
        });
        return "Real Bedrock Response";
      } catch (err) {
        if (isTimedOut || abortController.signal.aborted || err?.name === "AbortError") {
          // Bounded fallback reached
        }
      } finally {
        clearTimeout(timeoutId);
        timerCleanedUp = true;
      }

      return simulateBedrockResponse(prompt);
    };

    const startTime = Date.now();
    const result = await generateResponse("Hello Vitalis, how is my health?");
    const elapsed = Date.now() - startTime;

    assert.equal(abortCalled, true, "Underlying AWS SDK request must be aborted via signal");
    assert.equal(timerCleanedUp, true, "Timeout must be cleared in finally block");
    assert.ok(result.includes("Simulated response to: Hello Vitalis"), "Must cleanly return fallback response");
    assert.ok(elapsed < 60, `Timed out and recovered promptly in ${elapsed}ms`);
  });
});
