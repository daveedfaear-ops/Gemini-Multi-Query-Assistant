import React, { useState, useRef } from 'react';
import { runKnowledgeQuery } from '../services/geminiService';
import { searchKnowledge, addArticleToKnowledgeBase, getKnowledgeBase, setKnowledgeBase } from '../services/knowledgeBaseService';
import type { KnowledgeArticle } from '../services/knowledgeBaseService';
import ResponseCard from './ResponseCard';
import { LoadingSpinner, UploadIcon, DownloadIcon, FolderOpenIcon } from './icons/Icons';

const KnowledgePanel: React.FC = () => {
  const [keywords, setKeywords] = useState('');
  const [searchResults, setSearchResults] = useState<Omit<KnowledgeArticle, 'keywords'>[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<(Omit<KnowledgeArticle, 'keywords'> & { content: string }) | null>(null);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string>('');
  const [isSearchingKB, setIsSearchingKB] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadFileRef = useRef<HTMLInputElement>(null);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleKnowledgeSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywords.trim() || isSearchingKB) return;

    setIsSearchingKB(true);
    setSelectedArticle(null);
    setSearchResults([]);
    setError(null);
    setResponse('');

    try {
      const results = await searchKnowledge(keywords);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search knowledge base.');
    } finally {
      setIsSearchingKB(false);
    }
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setError(null);
    setResponse('');
    showNotification(`Processing "${file.name}"...`);

    try {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const content = e.target?.result as string;
                await addArticleToKnowledgeBase(file.name, content);
                showNotification(`Successfully added "${file.name}" to the knowledge base.`);
                setKeywords('');
                setSearchResults([]);
            } catch (err) {
                 setError(err instanceof Error ? err.message : 'Failed to process and add file.');
                 showNotification(`Error processing "${file.name}".`);
            } finally {
                setIsProcessingFile(false);
                if(fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.onerror = () => {
            setError('Failed to read the file.');
            showNotification(`Error reading "${file.name}".`);
            setIsProcessingFile(false);
        };
        reader.readAsText(file);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred during file processing.');
        setIsProcessingFile(false);
    }
};

  const handleSaveKnowledgeBase = () => {
    try {
      const kb = getKnowledgeBase();
      const kbString = JSON.stringify(kb, null, 2);
      const blob = new Blob([kbString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "gemini-knowledge-base.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification("Knowledge base saved successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      setError(`Failed to save knowledge base: ${message}`);
      showNotification("Error saving knowledge base.");
    }
  };

  const handleLoadFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target?.result as string;
            const parsedKb = JSON.parse(content);
            setKnowledgeBase(parsedKb); // This will throw an error if format is invalid
            showNotification(`Successfully loaded "${file.name}".`);
            // Reset state
            setKeywords('');
            setSearchResults([]);
            setSelectedArticle(null);
            setResponse('');
            setError(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load and parse file.';
            setError(message);
            showNotification(`Error loading "${file.name}".`);
        } finally {
            if(loadFileRef.current) loadFileRef.current.value = '';
        }
    };
    reader.onerror = () => {
        setError('Failed to read the file.');
        showNotification(`Error reading "${file.name}".`);
    };
    reader.readAsText(file);
  };

  const handleArticleSelect = (article: Omit<KnowledgeArticle, 'keywords'>) => {
    const fullArticle = article as (Omit<KnowledgeArticle, 'keywords'> & { content: string });
    setSelectedArticle(fullArticle);
    setResponse('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !selectedArticle || isLoadingAI) return;

    setIsLoadingAI(true);
    setError(null);
    setResponse('');
    const currentPrompt = prompt;
    setPrompt('');

    try {
      const result = await runKnowledgeQuery(currentPrompt, selectedArticle.content);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSaveAIResult = () => {
    if (!response) return;

    const blob = new Blob([response], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gemini-knowledge-result.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isLoading = isSearchingKB || isProcessingFile || isLoadingAI;

  return (
    <div className="flex flex-col h-full p-4 md:p-6 bg-background-primary">
       {notification && (
        <div className="absolute top-4 right-4 bg-brand-secondary text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
          {notification}
        </div>
      )}
      <h2 className="text-2xl font-bold mb-1 text-white">Knowledge Base Query</h2>
      <p className="text-content-secondary mb-4">Ask questions about internal documents. Upload, save, or load your knowledge base.</p>
      
      <div className="flex-1 flex flex-col overflow-y-auto space-y-4 pr-2">
        {/* Step 1: Search */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Step 1: Find a relevant article</h3>
          <div className="flex items-center space-x-4">
            <form onSubmit={handleKnowledgeSearch} className="flex-1 flex items-center space-x-2">
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Enter keywords (e.g., 'return policy')"
                className="flex-1 p-2 bg-background-secondary border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !keywords.trim()}
                className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
              >
                {isSearchingKB ? <LoadingSpinner /> : 'Search'}
              </button>
            </form>
            <div className="flex items-center space-x-2 border-l border-border-color pl-4">
               <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt,.md,.json,.csv" />
               <input type="file" ref={loadFileRef} onChange={handleLoadFileChange} className="hidden" accept=".json" />
               <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} title="Upload new file to knowledge base" className="p-2 bg-background-secondary border border-border-color text-white font-semibold rounded-lg hover:bg-background-primary disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"> <UploadIcon /> </button>
               <button onClick={() => loadFileRef.current?.click()} disabled={isLoading} title="Load knowledge base from file" className="p-2 bg-background-secondary border border-border-color text-white font-semibold rounded-lg hover:bg-background-primary disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"> <FolderOpenIcon /> </button>
               <button onClick={handleSaveKnowledgeBase} disabled={isLoading} title="Save knowledge base to file" className="p-2 bg-background-secondary border border-border-color text-white font-semibold rounded-lg hover:bg-background-primary disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"> <DownloadIcon /> </button>
            </div>
          </div>
        </div>
        
        {/* Search Results */}
        <div className="bg-background-secondary p-4 rounded-lg shadow-inner min-h-[150px] max-h-[250px] overflow-y-auto">
          {isSearchingKB && <p className="text-content-secondary animate-pulse">Searching knowledge base...</p>}
          {isProcessingFile && <p className="text-content-secondary animate-pulse">Processing and adding file...</p>}
          {!isSearchingKB && !isProcessingFile && searchResults.length === 0 && (
            <p className="text-content-secondary">Search for articles or upload a new file.</p>
          )}
          {!isSearchingKB && !isProcessingFile && searchResults.length > 0 && (
            <ul className="space-y-2">
              {searchResults.map((article) => (
                <li key={article.id}>
                  <button
                    onClick={() => handleArticleSelect(article)}
                    className={`w-full text-left p-3 rounded-md transition-all duration-200 border ${selectedArticle?.id === article.id ? 'bg-brand-primary/20 border-brand-primary shadow-md' : 'border-transparent hover:bg-background-primary'}`}
                  >
                    <p className="font-semibold text-content-primary">{article.title}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Step 2: Query */}
        <div className={`transition-opacity duration-500 ${selectedArticle ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <h3 className="text-lg font-semibold text-white mb-2">Step 2: Ask a question with context</h3>
          {selectedArticle && (
            <div className="p-3 rounded-lg bg-background-secondary mb-2 border-l-4 border-brand-primary">
              <p className="text-sm text-content-secondary">Using context: <span className="font-semibold text-white">{selectedArticle.title}</span></p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex items-center space-x-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={selectedArticle ? "Ask a specific question..." : "Select an article first..."}
              className="flex-1 p-3 bg-background-secondary border border-border-color rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none resize-none"
              rows={2}
              disabled={!selectedArticle || isLoadingAI}
            />
            <button
              type="submit"
              disabled={!selectedArticle || isLoadingAI || !prompt.trim()}
              className="px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors self-stretch"
            >
              {isLoadingAI ? <LoadingSpinner /> : 'Ask'}
            </button>
          </form>
        </div>
        
        {/* Response */}
        <div className="flex-1 min-h-[200px]">
          <ResponseCard 
            response={response}
            isLoading={isLoadingAI}
            error={error}
            introText="The model's answer will appear here after you ask a question."
            onSave={handleSaveAIResult}
          />
        </div>
      </div>
    </div>
  );
};

export default KnowledgePanel;