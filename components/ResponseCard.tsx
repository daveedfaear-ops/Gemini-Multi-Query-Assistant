import React from 'react';
import { SearchResult } from '../types';
import { DownloadIcon } from './icons/Icons';
import AmbientCanvas from './AmbientCanvas';

interface ResponseCardProps {
  response: string | SearchResult;
  isLoading: boolean;
  error: string | null;
  introText: string;
  onSave?: () => void;
}

const ResponseCard: React.FC<ResponseCardProps> = ({ response, isLoading, error, introText, onSave }) => {
  const renderContent = () => {
    if (error) {
      return (
        <div className="text-red-400 bg-red-900/20 p-4 rounded-md">
          <p className="font-bold">An error occurred:</p>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      );
    }

    if (!response || (typeof response === 'string' && !response) || (typeof response === 'object' && !response.text)) {
      return <p className="text-content-secondary">{introText}</p>;
    }

    const responseText = typeof response === 'string' ? response : response.text;
    const sources = typeof response === 'object' && 'sources' in response ? response.sources : [];

    // Basic markdown to HTML conversion
    const formattedText = responseText
      .split('**').map((part, index) => index % 2 !== 0 ? `<strong class="font-bold text-white">${part}</strong>` : part)
      .join('')
      .split('*').map((part, index) => index % 2 !== 0 ? `<em class="italic">${part}</em>` : part)
      .join('')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-background-primary p-3 rounded-md my-2 overflow-x-auto text-sm"><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-background-primary px-1.5 py-1 rounded-md text-brand-primary/80 text-sm">$1</code>')
      .replace(/\n/g, '<br />');

    const hasContent = !isLoading && !error && response && ((typeof response === 'string' && response) || (typeof response === 'object' && response.text));

    return (
      <>
        <div className="prose prose-invert max-w-none text-content-primary" dangerouslySetInnerHTML={{ __html: formattedText }} />
        {sources && sources.length > 0 && (
          <div className="mt-6 border-t border-border-color pt-4">
            <h3 className="text-sm font-semibold text-content-secondary mb-2">Sources:</h3>
            <ul className="space-y-2">
              {sources.map((source, index) =>
                source.web ? (
                  <li key={index} className="flex items-center">
                     <span className="flex-shrink-0 w-4 h-4 text-content-secondary">🌐</span>
                    <a
                      href={source.web.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-sm text-blue-400 hover:text-blue-300 hover:underline truncate"
                      title={source.web.uri}
                    >
                      {source.web.title || source.web.uri}
                    </a>
                  </li>
                ) : null
              )}
            </ul>
          </div>
        )}
        {hasContent && onSave && (
          <div className="mt-6 border-t border-border-color pt-4 flex justify-end">
            <button
              onClick={onSave}
              className="inline-flex items-center px-4 py-2 bg-background-primary border border-border-color text-content-secondary font-semibold rounded-lg hover:bg-border-color hover:text-white transition-colors text-sm"
            >
              <DownloadIcon />
              <span className="ml-2">Save Result</span>
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="relative bg-background-secondary p-6 rounded-lg shadow-inner min-h-[200px] flex items-center justify-center overflow-hidden">
      {isLoading ? (
        <>
          <AmbientCanvas />
          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <span className="text-content-secondary animate-pulse">Generating response...</span>
            <p className="text-xs text-content-secondary/70 mt-2">The AI is thinking deeply.</p>
          </div>
        </>
      ) : (
        <div className="w-full h-full">
          {renderContent()}
        </div>
      )}
    </div>
  );
};

export default ResponseCard;
