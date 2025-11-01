import React from 'react';

interface TabButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, icon, isActive, onClick }) => {
  const baseClasses =
    'w-full flex items-center p-3 rounded-lg transition-colors duration-200 ease-in-out';
  const activeClasses = 'bg-brand-primary text-white shadow-md';
  const inactiveClasses = 'text-content-secondary hover:bg-background-primary hover:text-white';

  return (
    <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      {icon}
      <span className="hidden md:inline-block ml-4 font-medium">{label}</span>
    </button>
  );
};

export default TabButton;