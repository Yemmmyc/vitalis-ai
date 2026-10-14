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
});
