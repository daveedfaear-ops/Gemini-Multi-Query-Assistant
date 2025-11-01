import React, { useState } from 'react';
import { runTask } from '../services/geminiService';
import ResponseCard from './ResponseCard';
import { LoadingSpinner } from './icons/Icons';

type Model = 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gemini-flash-lite-latest';

const TaskPanel: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<Model>('gemini-2.5-flash');
  const [response, setResponse] = useState<string>('');
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
      const result = await runTask(currentPrompt, selectedModel);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value as Model);
  }

  const handleSaveResults = () => {
    if (!response) return;

    const blob = new Blob([response], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gemini-task-result.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-6 bg-background-primary">
      <h2 className="text-2xl font-bold mb-1 text-white">Flexible Tasks</h2>
      <p className="text-content-secondary mb-4">Analyze content, get editing suggestions, and more. Choose the right model for the job.</p>
      
      <div className="flex-1 overflow-y-auto mb-4">
        <ResponseCard 
          response={response}
          isLoading={isLoading}
          error={error}
          introText="Your task result will be displayed here. Paste content and provide instructions below."
          onSave={handleSaveResults}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'Summarize this article...' or 'Proofread this email...'"
          className="w-full p-3 bg-background-secondary border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none"
          rows={4}
          disabled={isLoading}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
             <label htmlFor="model-select" className="text-sm font-medium text-content-secondary">
              Select Model:
            </label>
            <select
              id="model-select"
              value={selectedModel}
              onChange={handleModelChange}
              disabled={isLoading}
              className="bg-background-secondary border border-border-color rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none"
            >
              <option value="gemini-2.5-flash">Flash (Fast)</option>
              <option value="gemini-flash-lite-latest">Flash Lite (Fastest)</option>
              <option value="gemini-2.5-pro">Pro (Complex Tasks)</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <LoadingSpinner /> : 'Run Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskPanel;