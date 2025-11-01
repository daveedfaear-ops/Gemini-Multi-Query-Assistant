import React, { useState } from 'react';
import { SearchResult } from '../types';
import { runSearch } from '../services/geminiService';
import ResponseCard from './ResponseCard';
import { LoadingSpinner } from './icons/Icons';

const SearchPanel: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);
    const currentPrompt = prompt;
    setPrompt('');

    try {
      const result = await runSearch(currentPrompt);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveResults = () => {
    if (!response?.text) return;

    const blob = new Blob([response.text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gemini-search-result.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-6 bg-background-primary">
      <h2 className="text-2xl font-bold mb-1 text-white">Search with Grounding</h2>
      <p className="text-content-secondary mb-4">Get up-to-date, accurate information from the web.</p>
      
      <div className="flex-1 overflow-y-auto mb-4">
        <ResponseCard 
          response={response}
          isLoading={isLoading}
          error={error}
          introText="The model's response, along with web sources, will appear here."
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
          placeholder="Ask about recent events or trending topics..."
          className="flex-1 p-3 bg-background-secondary border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none resize-none"
          rows={2}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors self-stretch"
        >
          {isLoading ? <LoadingSpinner /> : 'Search'}
        </button>
      </form>
    </div>
  );
};

export default SearchPanel;