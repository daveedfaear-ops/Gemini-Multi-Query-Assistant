import React, { useState } from 'react';
import { Tab } from './types';
import TabButton from './components/TabButton';
import ChatPanel from './components/ChatPanel';
import SearchPanel from './components/SearchPanel';
import TaskPanel from './components/TaskPanel';
import ThinkingPanel from './components/ThinkingPanel';
import KnowledgePanel from './components/KnowledgePanel';
import { ChatIcon, SearchIcon, TaskIcon, ThinkingIcon, KnowledgeIcon } from './components/icons/Icons';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Chat);

  const renderPanel = () => {
    switch (activeTab) {
      case Tab.Chat:
        return <ChatPanel />;
      case Tab.Search:
        return <SearchPanel />;
      case Tab.Task:
        return <TaskPanel />;
      case Tab.Think:
        return <ThinkingPanel />;
      case Tab.Knowledge:
        return <KnowledgePanel />;
      default:
        return <ChatPanel />;
    }
  };

  return (
    <div className="flex h-screen bg-background-primary text-content-primary font-sans">
      <nav className="w-16 md:w-64 bg-background-secondary p-2 md:p-4 flex flex-col justify-between border-r border-border-color">
        <div>
          <div className="flex items-center justify-center md:justify-start mb-8">
            <svg className="w-8 h-8 text-brand-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.0656 3.31688C14.0656 3.31688 15.8231 5.07438 17.5806 5.07438C19.3381 5.07438 21.0956 3.31688 21.0956 3.31688" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 11.0312C12 11.0312 10.2425 9.27375 8.485 9.27375C6.7275 9.27375 4.97 11.0312 4.97 11.0312" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9.89043 21.096C9.89043 21.096 8.13293 19.3385 6.37543 19.3385C4.61793 19.3385 2.86043 21.096 2.86043 21.096" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21.0956 16.9031C21.0956 16.9031 19.3381 18.6606 17.5806 18.6606C15.8231 18.6606 14.0656 16.9031 14.0656 16.9031" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4.21991 3.81836L12.0007 12.0009L19.7814 20.1834" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h1 className="hidden md:block ml-3 text-xl font-bold text-white">Gemini UI</h1>
          </div>
          <ul className="space-y-2">
            <li>
              <TabButton
                label="Chat"
                icon={<ChatIcon />}
                isActive={activeTab === Tab.Chat}
                onClick={() => setActiveTab(Tab.Chat)}
              />
            </li>
            <li>
              <TabButton
                label="Search"
                icon={<SearchIcon />}
                isActive={activeTab === Tab.Search}
                onClick={() => setActiveTab(Tab.Search)}
              />
            </li>
            <li>
              <TabButton
                label="Tasks"
                icon={<TaskIcon />}
                isActive={activeTab === Tab.Task}
                onClick={() => setActiveTab(Tab.Task)}
              />
            </li>
            <li>
              <TabButton
                label="Thinking Mode"
                icon={<ThinkingIcon />}
                isActive={activeTab === Tab.Think}
                onClick={() => setActiveTab(Tab.Think)}
              />
            </li>
             <li>
              <TabButton
                label="Knowledge"
                icon={<KnowledgeIcon />}
                isActive={activeTab === Tab.Knowledge}
                onClick={() => setActiveTab(Tab.Knowledge)}
              />
            </li>
          </ul>
        </div>
        <div className="hidden md:block p-4 bg-background-primary rounded-lg text-center text-sm text-content-secondary">
          <p>Powered by Google Gemini</p>
          <p className="mt-1">A versatile AI assistant.</p>
        </div>
      </nav>

      <main className="flex-1 flex flex-col h-screen">
        {renderPanel()}
      </main>
    </div>
  );
};

export default App;