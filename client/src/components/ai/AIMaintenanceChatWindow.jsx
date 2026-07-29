import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, FileText, Sparkles, BookOpen, ChevronRight, HelpCircle } from 'lucide-react';

export default function AIMaintenanceChatWindow({ 
  messages = [], 
  onSendMessage, 
  isLoading = false,
  assetName = null 
}) {
  const [input, setInput] = useState('');
  const [activeSources, setActiveSources] = useState(null);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    "What are allowable ISO 10816 vibration limits for feed pumps?",
    "How to diagnose rolling element bearing spalling from thermal readings?",
    "Step-by-step laser alignment procedure for drive couplings",
    "What spare seals are required for hydraulic cylinder leak repairs?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage && onSendMessage(input);
    setInput('');
  };

  const handleChipClick = (q) => {
    if (isLoading) return;
    onSendMessage && onSendMessage(q);
  };

  return (
    <div className="glass-panel rounded-2xl border border-industrial-border flex flex-col h-[700px] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-industrial-800/90 border-b border-industrial-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-accent-cyan to-blue-600 rounded-xl text-white shadow-md shadow-accent-cyan/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              AI Maintenance Engineer (RAG Chat)
            </h3>
            <p className="text-xs text-gray-400">
              Grounded in plant OEM manuals & pgvector knowledge corpus {assetName ? `• Asset: ${assetName}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs text-emerald-400 font-mono font-bold">RAG Corpus Active</span>
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 space-y-4">
            <Bot className="w-12 h-12 text-accent-cyan mx-auto opacity-80" />
            <h4 className="text-lg font-bold text-white">Ask the AI Maintenance Engineer</h4>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Ask natural language technical troubleshooting questions. Gemini retrieves relevant OEM manual pages and failure logs to ground every answer with citations.
            </p>

            <div className="pt-4 max-w-lg mx-auto">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Suggested Technical Questions</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChipClick(q)}
                    className="p-3 bg-industrial-900/80 hover:bg-industrial-700 border border-industrial-border rounded-xl text-xs text-gray-300 hover:text-white transition-all text-left flex items-start gap-2 group"
                  >
                    <HelpCircle className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
                    <span className="group-hover:text-accent-cyan transition-colors">{q}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={msg.id || idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-accent-cyan/20 border border-accent-cyan/40 text-accent-cyan flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'bg-gradient-to-r from-accent-cyan to-blue-600 text-white font-medium shadow-md'
                : 'bg-industrial-900/90 text-gray-200 border border-industrial-border shadow-lg'
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Source Citations Drawer Button */}
              {msg.retrieved_sources && msg.retrieved_sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-industrial-border">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-accent-cyan mb-1.5 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    Grounded OEM Source Citations ({msg.retrieved_sources.length})
                  </div>
                  <div className="space-y-1.5">
                    {msg.retrieved_sources.map((src, sIdx) => (
                      <div key={sIdx} className="bg-industrial-800/80 p-2 rounded-lg border border-industrial-border flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-3.5 h-3.5 text-accent-amber shrink-0" />
                          <span className="font-semibold text-gray-200 truncate">{src.title}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono shrink-0 ml-2">{src.storage_path || 'OEM Spec'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-industrial-700 text-gray-200 flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-accent-cyan/20 border border-accent-cyan/40 text-accent-cyan flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-industrial-900 p-4 rounded-2xl border border-industrial-border text-xs text-gray-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-cyan animate-pulse" />
              Gemini RAG engine searching vector corpus and reasoning...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 bg-industrial-800/90 border-t border-industrial-border flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI Maintenance Engineer a question..."
          className="flex-1 bg-industrial-900 border border-industrial-border rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            input.trim() && !isLoading
              ? 'bg-accent-cyan hover:bg-cyan-400 text-industrial-900 shadow-md shadow-accent-cyan/20 cursor-pointer'
              : 'bg-industrial-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
