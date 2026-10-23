import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, Sparkles, AlertCircle, Bot } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

interface VoiceAssistantProps {
  onSendMessage: (msg: string) => Promise<{ spokenResponse: string; toolExecutions: any[] }>;
  isThinking: boolean;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onSendMessage, isThinking }) => {
  const [inputText, setInputText] = useState('');
  const [lastRecognizedText, setLastRecognizedText] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [isRecognizingSpeech, setIsRecognizingSpeech] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [spokenResponse, setSpokenResponse] = useState<string>(
    "Good morning Eleanor! I'm Vitalis, your health advocate. How are you feeling today?"
  );
  const [activeTools, setActiveTools] = useState<any[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastSpokenRef = useRef<string>('');
  const hasSubmittedRef = useRef<boolean>(false);
  const isSubmittingRef = useRef<boolean>(false);
  const sessionTextRef = useRef<string>('');
  const currentSessionIdRef = useRef<number>(0);

  useEffect(() => {
    // Setup Web Speech API SpeechSynthesis voices preloading for Web Browser mode
    if (!Capacitor.isNativePlatform() && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const available = window.speechSynthesis.getVoices();
        if (available && available.length > 0) {
          voicesRef.current = available;
        }
      };
      loadVoices();
      if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    // Setup Web Speech API SpeechRecognition if supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const sessionId = currentSessionIdRef.current;
        if (sessionId === 0 || hasSubmittedRef.current) {
          return;
        }

        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
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
        const trimmedCombined = combined.trim();

        if (trimmedCombined) {
          sessionTextRef.current = trimmedCombined;
          lastSpokenRef.current = trimmedCombined;
          setInputText(trimmedCombined);
          setVoiceNotice(null);
          setIsRecognizingSpeech(true);
        }

        const trimmedFinal = finalTranscript.trim();
        const hasInterim = interimTranscript.trim().length > 0;

        // If we have final results and no ongoing interim text, finalize and submit immediately
        if (trimmedFinal && !hasInterim && !hasSubmittedRef.current && !isSubmittingRef.current && !isThinking) {
          hasSubmittedRef.current = true;
          sessionTextRef.current = '';
          lastSpokenRef.current = '';
          setIsListening(false);
          setIsRecognizingSpeech(false);
          try {
            recognition.stop();
          } catch {
            // ignore
          }
          setLastRecognizedText(trimmedFinal);
          handleSend(trimmedFinal);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('[Vitalis AI Voice Recognition Error]:', err);
        const errType = err?.error;

        if (errType === 'no-speech') {
          // If a usable transcript was already captured during this session, do not wipe it and do not show error banner.
          // onend will handle submitting the pending text.
          if (!sessionTextRef.current.trim()) {
            setVoiceNotice("No speech detected. Tap the mic or choose a quick prompt to try again.");
          }
          setIsListening(false);
          setIsRecognizingSpeech(false);
        } else if (errType === 'not-allowed' || errType === 'permission-denied') {
          // Permission denied: ensure nothing is auto-submitted on onend
          hasSubmittedRef.current = true;
          sessionTextRef.current = '';
          lastSpokenRef.current = '';
          setIsListening(false);
          setIsRecognizingSpeech(false);
          setVoiceNotice("Microphone permission was not allowed. You can type your request or check browser permissions.");
        } else if (errType === 'audio-capture') {
          hasSubmittedRef.current = true;
          sessionTextRef.current = '';
          lastSpokenRef.current = '';
          setIsListening(false);
          setIsRecognizingSpeech(false);
          setVoiceNotice("No microphone was found or microphone could not be accessed.");
        } else if (errType === 'network') {
          hasSubmittedRef.current = true;
          sessionTextRef.current = '';
          lastSpokenRef.current = '';
          setIsListening(false);
          setIsRecognizingSpeech(false);
          setVoiceNotice("Voice network connection issue. You can try speaking again or use text input.");
        } else if (errType === 'aborted') {
          hasSubmittedRef.current = true;
          sessionTextRef.current = '';
          lastSpokenRef.current = '';
          setIsListening(false);
          setIsRecognizingSpeech(false);
          setVoiceNotice(null);
        } else {
          setIsListening(false);
          setIsRecognizingSpeech(false);
          if (!sessionTextRef.current.trim()) {
            hasSubmittedRef.current = true;
            setVoiceNotice("Voice recognition stopped. You can tap the mic again or type your message below.");
          }
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setIsRecognizingSpeech(false);

        // Auto-submit pending transcript if recognition ended without an explicit final event
        const pending = sessionTextRef.current.trim() || lastSpokenRef.current.trim();
        sessionTextRef.current = '';
        lastSpokenRef.current = '';

        if (pending && !hasSubmittedRef.current && !isSubmittingRef.current && !isThinking) {
          hasSubmittedRef.current = true;
          setLastRecognizedText(pending);
          handleSend(pending);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      currentSessionIdRef.current++;
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      if (activeUtteranceRef.current) {
        activeUtteranceRef.current.onstart = null;
        activeUtteranceRef.current.onend = null;
        activeUtteranceRef.current.onerror = null;
        activeUtteranceRef.current = null;
      }
      if (!Capacitor.isNativePlatform() && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getBestEnglishVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
    if (!voices || voices.length === 0) return null;
    const enUs = voices.find(v => v.lang === 'en-US' || v.lang === 'en_US');
    if (enUs) return enUs;
    const en = voices.find(v => v.lang.toLowerCase().startsWith('en'));
    if (en) return en;
    return voices[0];
  };

  const stopCurrentSpeech = () => {
    if (activeUtteranceRef.current) {
      activeUtteranceRef.current.onstart = null;
      activeUtteranceRef.current.onend = null;
      activeUtteranceRef.current.onerror = null;
      activeUtteranceRef.current = null;
    }
    if (!Capacitor.isNativePlatform() && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }
    setIsSpeaking(false);
  };

  const speakText = async (text: string) => {
    if (!text || !text.trim()) return;

    // Native Android / Mobile TTS Flow via Capacitor Native Plugin
    if (Capacitor.isNativePlatform()) {
      try {
        setIsSpeaking(true);
        await TextToSpeech.stop().catch(() => {});
        await TextToSpeech.speak({
          text,
          lang: 'en-US',
          rate: 0.95,
          pitch: 1.05,
          volume: 1.0,
          category: 'ambient',
        });
        setIsSpeaking(false);
      } catch (err) {
        console.error('[Vitalis AI Native TTS Error]: Failed to synthesize speech on Android device:', err);
        setIsSpeaking(false);
      }
      return;
    }

    // Web Browser Fallback Flow (Desktop/Web Mode)
    if (!('speechSynthesis' in window)) {
      console.warn('[Vitalis AI Web TTS Warning]: SpeechSynthesis is not supported in this browser context.');
      return;
    }

    try {
      stopCurrentSpeech();

      const doSpeak = () => {
        let voices = voicesRef.current;
        if (!voices || voices.length === 0) {
          voices = window.speechSynthesis.getVoices();
          voicesRef.current = voices;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        activeUtteranceRef.current = utterance;
        utterance.lang = 'en-US';
        utterance.rate = 0.95; // Gentle elder-friendly pace
        utterance.pitch = 1.05;

        const chosenVoice = getBestEnglishVoice(voices);
        if (chosenVoice) {
          utterance.voice = chosenVoice;
        }

        utterance.onstart = () => {
          setIsSpeaking(true);
        };

        utterance.onend = () => {
          if (activeUtteranceRef.current === utterance) {
            activeUtteranceRef.current = null;
          }
          setIsSpeaking(false);
        };

        utterance.onerror = (e) => {
          if (activeUtteranceRef.current === utterance) {
            activeUtteranceRef.current = null;
          }
          setIsSpeaking(false);
          if (e.error !== 'canceled' && e.error !== 'interrupted') {
            console.warn('[Vitalis AI Web TTS Utterance Notice]:', e.error);
          }
        };

        // Resume if browser synthesis is in paused state
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        window.speechSynthesis.speak(utterance);
      };

      if (voicesRef.current.length === 0 && window.speechSynthesis.getVoices().length === 0) {
        let resolved = false;
        const onVoicesChanged = () => {
          if (resolved) return;
          resolved = true;
          voicesRef.current = window.speechSynthesis.getVoices();
          window.speechSynthesis.onvoiceschanged = null;
          doSpeak();
        };
        window.speechSynthesis.onvoiceschanged = onVoicesChanged;
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            doSpeak();
          }
        }, 250);
      } else {
        doSpeak();
      }
    } catch (err) {
      console.error('[Vitalis AI Web TTS Exception]: Error in speakText:', err);
      setIsSpeaking(false);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!query || isSubmittingRef.current || isThinking) return;

    // Synchronous guards to prevent duplicate parallel dispatch
    isSubmittingRef.current = true;
    hasSubmittedRef.current = true;
    sessionTextRef.current = '';
    lastSpokenRef.current = '';
    setVoiceNotice(null);
    setInputText('');
    setIsRecognizingSpeech(false);
    setIsListening(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    try {
      const res = await onSendMessage(query);
      if (res && res.spokenResponse) {
        setSpokenResponse(res.spokenResponse);
        setActiveTools(res.toolExecutions || []);
        speakText(res.spokenResponse);
      }
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const toggleMic = () => {
    setVoiceNotice(null);
    if (isListening) {
      // Explicit tap-to-finish: user tapped mic while listening to finalize immediately
      setIsListening(false);
      setIsRecognizingSpeech(false);

      const pending = sessionTextRef.current.trim() || lastSpokenRef.current.trim();
      sessionTextRef.current = '';
      lastSpokenRef.current = '';

      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }

      if (pending && !hasSubmittedRef.current && !isSubmittingRef.current && !isThinking) {
        hasSubmittedRef.current = true;
        setLastRecognizedText(pending);
        handleSend(pending);
      } else {
        hasSubmittedRef.current = true;
      }
    } else {
      // Start a new session: safely reset per-utterance state
      currentSessionIdRef.current += 1;
      hasSubmittedRef.current = false;
      sessionTextRef.current = '';
      lastSpokenRef.current = '';
      setLastRecognizedText('');
      setIsRecognizingSpeech(false);

      if (recognitionRef.current) {
        try {
          // If previous recognition was still stopping/active, abort it safely first
          try {
            recognitionRef.current.abort();
          } catch {
            // ignore
          }
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e: any) {
          setIsListening(false);
          setIsRecognizingSpeech(false);
          setVoiceNotice("Could not start microphone. Please check permissions or type below.");
        }
      } else {
        alert("Speech recognition is not supported in this browser. Please use the prompt buttons or text input!");
      }
    }
  };

  const samplePrompts = [
    "What pills do I need to take today?",
    "I just took my morning Lisinopril",
    "I am feeling sudden tight chest pain",
    "I feel a little dizzy standing up"
  ];

  return (
    <div className="glass-card rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden flex flex-col justify-between max-w-full">
      {/* Visual Glowing Alexa+ Ring */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 pb-3.5 sm:pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative shrink-0">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full alexa-gradient flex items-center justify-center transition-all ${
              isSpeaking
                ? 'ring-4 ring-sky-400 animate-pulse-glow'
                : isThinking
                ? 'ring-4 ring-amber-400 animate-pulse'
                : isListening && isRecognizingSpeech
                ? 'ring-4 ring-emerald-400 animate-pulse'
                : isListening
                ? 'ring-4 ring-rose-500 animate-pulse-glow'
                : 'shadow-lg shadow-sky-500/30'
            }`}>
              {isSpeaking ? (
                <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
              ) : isThinking ? (
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-spin" />
              ) : isListening ? (
                <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-bounce" />
              ) : (
                <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              )}
            </div>
            {(isSpeaking || isThinking || isListening) && (
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                  isSpeaking ? 'bg-sky-400' : isThinking ? 'bg-amber-400' : isRecognizingSpeech ? 'bg-emerald-400' : 'bg-rose-400'
                } opacity-75`} />
                <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
                  isSpeaking ? 'bg-sky-500' : isThinking ? 'bg-amber-500' : isRecognizingSpeech ? 'bg-emerald-500' : 'bg-rose-500'
                }`} />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">Alexa+ Voice Interface</h2>
              {isSpeaking && (
                <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                  <Volume2 className="w-3 h-3 animate-pulse" /> Speaking
                </span>
              )}
              {isThinking && (
                <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <Sparkles className="w-3 h-3 animate-spin" /> Waiting for AI
                </span>
              )}
              {isListening && isRecognizingSpeech && (
                <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <Mic className="w-3 h-3 animate-pulse" /> Recognizing Speech...
                </span>
              )}
              {isListening && !isRecognizingSpeech && (
                <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                  <Mic className="w-3 h-3 animate-bounce" /> Listening...
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400">MCP Telemetry • Amazon Bedrock</p>
          </div>
        </div>

        {/* Audio Waveform Animation */}
        <div className="hidden xs:flex items-center gap-1.5 h-8 px-2.5 py-1 rounded-xl bg-slate-900/80 border border-slate-800 shrink-0">
          <div className={`w-1 rounded-full transition-all ${
            isSpeaking ? 'bg-sky-400 animate-wave-1' : isThinking ? 'bg-amber-400 animate-wave-1' : isRecognizingSpeech ? 'bg-emerald-400 animate-wave-1' : isListening ? 'bg-rose-400 animate-wave-1' : 'bg-sky-400 h-2'
          }`} />
          <div className={`w-1 rounded-full transition-all ${
            isSpeaking ? 'bg-sky-400 animate-wave-2' : isThinking ? 'bg-amber-400 animate-wave-2' : isRecognizingSpeech ? 'bg-emerald-400 animate-wave-2' : isListening ? 'bg-rose-400 animate-wave-2' : 'bg-sky-400 h-3'
          }`} />
          <div className={`w-1 rounded-full transition-all ${
            isSpeaking ? 'bg-sky-400 animate-wave-3' : isThinking ? 'bg-amber-400 animate-wave-3' : isRecognizingSpeech ? 'bg-emerald-400 animate-wave-3' : isListening ? 'bg-rose-400 animate-wave-3' : 'bg-sky-400 h-4'
          }`} />
          <div className={`w-1 rounded-full transition-all ${
            isSpeaking ? 'bg-sky-400 animate-wave-4' : isThinking ? 'bg-amber-400 animate-wave-4' : isRecognizingSpeech ? 'bg-emerald-400 animate-wave-4' : isListening ? 'bg-rose-400 animate-wave-4' : 'bg-sky-400 h-2'
          }`} />
          <div className={`w-1 rounded-full transition-all ${
            isSpeaking ? 'bg-sky-400 animate-wave-5' : isThinking ? 'bg-amber-400 animate-wave-5' : isRecognizingSpeech ? 'bg-emerald-400 animate-wave-5' : isListening ? 'bg-rose-400 animate-wave-5' : 'bg-sky-400 h-3'
          }`} />
        </div>
      </div>

      {/* Response Bubble & Tool Badge */}
      <div className="my-5 flex-1 min-h-[140px] flex flex-col justify-center">
        {isThinking ? (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/90 border border-sky-500/30">
            <Sparkles className="w-5 h-5 text-sky-400 animate-spin" />
            <span className="text-sm font-medium text-sky-300">
              Alexa+ is reasoning and executing MCP tools with Amazon Bedrock...
            </span>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 relative">
            <div className="flex items-start justify-between gap-3">
              <p className="text-base text-slate-100 font-medium leading-relaxed flex-1">
                "{spokenResponse}"
              </p>
              <button
                type="button"
                onClick={() => speakText(spokenResponse)}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-sky-400 border border-slate-700/60 transition-all shrink-0 active:scale-95"
                title="Replay Voice Response"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Active tools invoked badge */}
            {activeTools.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">MCP Tools Invoked:</span>
                {activeTools.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                  >
                    ⚡ {t.tool}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Prompt Suggestion Chips */}
      <div className="mb-4">
        <p className="text-[11px] font-medium text-slate-400 mb-2">Try speaking or clicking a simulated prompt:</p>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={isThinking}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-sky-500/40 transition-all disabled:opacity-50"
            >
              "{p}"
            </button>
          ))}
        </div>
      </div>

      {/* Voice Recognition Notice Banner */}
      {voiceNotice && (
        <div className="mb-3 px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{voiceNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setVoiceNotice(null)}
            className="text-amber-400 hover:text-amber-200 text-sm px-1.5 py-0.5 rounded"
            title="Dismiss Notice"
          >
            ×
          </button>
        </div>
      )}

      {/* Recognized Voice Transcript Display */}
      {lastRecognizedText && (
        <div
          id="recognized-voice-transcript"
          className="mb-2.5 px-3.5 py-2 rounded-2xl bg-sky-500/10 border border-sky-500/25 text-xs text-sky-200 flex items-center justify-between gap-2 animate-fadeIn"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="shrink-0 flex items-center gap-1 font-semibold text-sky-400">
              <Mic className="w-3.5 h-3.5 text-sky-400" />
              You said:
            </span>
            <span className="truncate italic text-slate-100 font-medium">
              "{lastRecognizedText}"
            </span>
          </div>
          <button
            type="button"
            onClick={() => setLastRecognizedText('')}
            className="text-slate-400 hover:text-slate-200 text-sm px-1.5 py-0.5 rounded shrink-0 transition-colors"
            title="Dismiss transcript"
          >
            ×
          </button>
        </div>
      )}

      {/* Input Bar with Mic & Send */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <button
          type="button"
          onClick={toggleMic}
          className={`p-3 rounded-2xl transition-all ${
            isListening
              ? isRecognizingSpeech
                ? 'bg-emerald-500 text-white animate-pulse'
                : 'bg-rose-500 text-white animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700'
          }`}
          title={isListening ? "Tap to finish speaking" : "Push to talk (Speech-to-Text)"}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Speak to Alexa or type here (e.g. 'Did I take my pills?')..."
          className="flex-1 bg-slate-900/90 text-sm text-slate-100 placeholder-slate-500 px-4 py-3 rounded-2xl border border-slate-800 focus:outline-none focus:border-sky-500/60"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isThinking}
          className="p-3 rounded-2xl alexa-gradient text-white hover:opacity-95 transition-all disabled:opacity-40 shadow-md shadow-sky-500/20"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
