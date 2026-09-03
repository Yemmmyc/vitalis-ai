import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, Sparkles, AlertCircle, Bot } from 'lucide-react';

interface VoiceAssistantProps {
  onSendMessage: (msg: string) => Promise<{ spokenResponse: string; toolExecutions: any[] }>;
  isThinking: boolean;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onSendMessage, isThinking }) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [spokenResponse, setSpokenResponse] = useState<string>(
    "Good morning Eleanor! I'm Vitalis, your health advocate. How are you feeling today?"
  );
  const [activeTools, setActiveTools] = useState<any[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Setup Web Speech API if supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSend(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Gentle elder-friendly pace
      utterance.pitch = 1.05;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isThinking) return;

    setInputText('');
    const res = await onSendMessage(query);
    if (res && res.spokenResponse) {
      setSpokenResponse(res.spokenResponse);
      setActiveTools(res.toolExecutions || []);
      speakText(res.spokenResponse);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          setIsListening(false);
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
    <div className="glass-card rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
      {/* Visual Glowing Alexa+ Ring */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-12 h-12 rounded-full alexa-gradient flex items-center justify-center transition-all ${
              isSpeaking || isListening ? 'ring-4 ring-sky-400 animate-pulse-glow' : 'shadow-lg shadow-sky-500/30'
            }`}>
              {isListening ? (
                <Mic className="w-6 h-6 text-white animate-bounce" />
              ) : (
                <Bot className="w-6 h-6 text-white" />
              )}
            </div>
            {(isSpeaking || isListening) && (
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-sky-500" />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Alexa+ Voice Interface</h2>
              {isSpeaking && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                  <Volume2 className="w-3 h-3 animate-pulse" /> Speaking
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">Model Context Protocol • Streamable HTTP • Amazon Bedrock</p>
          </div>
        </div>

        {/* Audio Waveform Animation */}
        <div className="flex items-center gap-1.5 h-8 px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className={`w-1 bg-sky-400 rounded-full transition-all ${isSpeaking || isListening ? 'animate-wave-1' : 'h-2'}`} />
          <div className={`w-1 bg-sky-400 rounded-full transition-all ${isSpeaking || isListening ? 'animate-wave-2' : 'h-3'}`} />
          <div className={`w-1 bg-sky-400 rounded-full transition-all ${isSpeaking || isListening ? 'animate-wave-3' : 'h-4'}`} />
          <div className={`w-1 bg-sky-400 rounded-full transition-all ${isSpeaking || isListening ? 'animate-wave-4' : 'h-2'}`} />
          <div className={`w-1 bg-sky-400 rounded-full transition-all ${isSpeaking || isListening ? 'animate-wave-5' : 'h-3'}`} />
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
            <p className="text-base text-slate-100 font-medium leading-relaxed">
              "{spokenResponse}"
            </p>

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
              ? 'bg-rose-500 text-white animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700'
          }`}
          title="Push to talk (Speech-to-Text)"
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
