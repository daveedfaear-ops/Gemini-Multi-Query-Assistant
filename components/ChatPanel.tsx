import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { ChatMessage } from '../types';
import { createChatSession, runChat } from '../services/geminiService';
import { LoadingSpinner } from './icons/Icons';

const ChatPanel: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatSession = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatSession.current = createChatSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading || !chatSession.current) return;

    const userMessage: ChatMessage = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);
    setError(null);

    try {
      const responseText = await runChat(chatSession.current, prompt, messages);
      const modelMessage: ChatMessage = { role: 'model', content: responseText };
      setMessages(prev => [...prev, modelMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
       const errorBotMessage: ChatMessage = { role: 'model', content: `Sorry, I encountered an error: ${errorMessage}` };
       setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-6 bg-background-primary">
      <h2 className="text-2xl font-bold mb-4 text-white">Chat Bot</h2>
      <div className="flex-1 overflow-y-auto bg-background-secondary p-4 rounded-lg shadow-inner mb-4">
        <div className="space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="text-center text-content-secondary py-8">
              <p>Start a conversation by typing below.</p>
            </div>
          )}
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xl px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-brand-primary text-white' : 'bg-background-primary text-content-primary'}`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="max-w-xl px-4 py-3 rounded-lg bg-background-primary text-content-primary">
                <div className="flex items-center space-x-2 animate-pulse-fast">
                    <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                    <div className="w-2 h-2 bg-brand-primary rounded-full" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-brand-primary rounded-full" style={{ animationDelay: '0.4s' }}></div>
                </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex items-center space-x-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          placeholder="Ask me anything..."
          className="flex-1 p-3 bg-background-secondary border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none resize-none"
          rows={1}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? <LoadingSpinner /> : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;