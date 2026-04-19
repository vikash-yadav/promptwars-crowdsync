'use client';
import React, { useState } from 'react';

export default function SyncBotChat() {
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Hello! I'm SyncBot. I'm monitoring the stadium in real-time. How can I help you beat the crowds today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-full max-w-md mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600">
        <h3 className="text-white font-bold text-xl flex items-center gap-2">
          <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
          SyncBot AI Concierge
        </h3>
        <p className="text-blue-100 text-sm">Live Stadium Optimizer</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
              msg.role === 'user' 
              ? 'bg-blue-600 text-white rounded-tr-none shadow-lg' 
              : 'bg-white/20 text-white backdrop-blur-md rounded-tl-none border border-white/10'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 p-4 rounded-2xl animate-pulse text-white/50">SyncBot is typing...</div>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="p-6 border-t border-white/10 bg-black/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask SyncBot..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-white/30"
          />
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg active:scale-95"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
