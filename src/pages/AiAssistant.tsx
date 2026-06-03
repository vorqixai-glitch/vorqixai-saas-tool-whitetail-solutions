import React, { useState } from 'react';
import { Bot, Send, User } from 'lucide-react';
import { trpc } from '../utils/trpc';

export default function AiAssistant() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I am your White Tail Solutions Assistant. I can help answer questions regarding state requirements, compliance, and NARR standards.", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  
  const chatMutation = trpc.ai.chat.useMutation();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const res = await chatMutation.mutateAsync({ message: input });
      setMessages(prev => [...prev, { id: Date.now() + 1, text: res.reply, sender: 'bot' }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Sorry, I am having trouble connecting.", sender: 'bot' }]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 bg-indigo-600 text-white flex items-center gap-3">
        <Bot className="w-6 h-6" />
        <h1 className="font-semibold text-lg">AI Assistant</h1>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-indigo-100 text-indigo-600'}`}>
                {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'}`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            className="w-full pl-4 pr-12 py-3 bg-slate-100 border-transparent rounded-full focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
            placeholder="Ask a question about compliance or requirements..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition disabled:opacity-50"
            disabled={!input.trim() || chatMutation.isPending}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
