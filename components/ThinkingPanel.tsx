import React, { useState } from 'react';
import { runThinking } from '../services/geminiService';
import ResponseCard from './ResponseCard';
import { LoadingSpinner } from './icons/Icons';

const ThinkingPanel: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] =useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResponse('');
    const currentPrompt = prompt;
    setPrompt('');

    try {
      const result = await runThinking(currentPrompt);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveResults = () => {
    if (!response) return;

    const blob = new Blob([response], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gemini-thinking-result.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-6 bg-background-primary">
      <h2 className="text-2xl font-bold mb-1 text-white">Deep Thinking Mode</h2>
      <p className="text-content-secondary mb-4">For your most complex queries. Uses Gemini 2.5 Pro with maximum reasoning budget.</p>
      
      <div className="flex-1 overflow-y-auto mb-4">
        <ResponseCard 
          response={response}
          isLoading={isLoading}
          error={error}
          introText="The model's detailed response to your complex query will appear here."
          onSave={handleSaveResults}
        />
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
          placeholder="Ask a complex question requiring deep reasoning..."
          className="flex-1 p-3 bg-background-secondary border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none resize-none"
          rows={2}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors self-stretch"
        >
          {isLoading ? <LoadingSpinner /> : 'Engage'}
        </button>
      </form>
    </div>
  );
};

export default ThinkingPanel;