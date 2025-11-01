import { extractKnowledgeFromFile } from "./geminiService";

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  keywords: string[];
}

const DEFAULT_KNOWLEDGE_BASE: KnowledgeArticle[] = [
  {
    id: 'feat-001',
    title: 'Quantum Drive Feature',
    keywords: ['quantum', 'drive', 'speed', 'performance', 'transfer'],
    content: 'The Quantum Drive allows for instantaneous data transfer across vast distances. It operates on principles of quantum entanglement, ensuring secure and high-speed communication. It is best suited for large-scale data synchronization and real-time collaboration.',
  },
  {
    id: 'policy-002',
    title: 'Return Policy',
    keywords: ['return', 'refund', 'policy', 'purchase', 'money back'],
    content: 'Our return policy allows for full refunds within 30 days of purchase. The product must be in its original condition. To initiate a return, please contact support with your order number. Returns are not accepted for digitally downloaded software.',
  },
  {
    id: 'setup-003',
    title: 'Initial Setup Guide',
    keywords: ['setup', 'install', 'guide', 'getting started', 'bluetooth'],
    content: 'To set up your device, first, connect it to a power source. Then, download the companion app from the app store. Follow the on-screen instructions in the app to pair your device via Bluetooth. The entire process should take less than 5 minutes.',
  },
];

let KNOWLEDGE_BASE: KnowledgeArticle[] = [];

const loadKnowledgeBase = () => {
  try {
    const savedKB = localStorage.getItem('knowledgeBase');
    KNOWLEDGE_BASE = savedKB ? JSON.parse(savedKB) : [...DEFAULT_KNOWLEDGE_BASE];
  } catch (error) {
    console.error("Failed to load knowledge base from localStorage", error);
    KNOWLEDGE_BASE = [...DEFAULT_KNOWLEDGE_BASE];
  }
};

const saveKnowledgeBase = () => {
  try {
    localStorage.setItem('knowledgeBase', JSON.stringify(KNOWLEDGE_BASE));
  } catch (error) {
    console.error("Failed to save knowledge base to localStorage", error);
  }
};

// Initial load when the module is imported
loadKnowledgeBase();

// Auto-save the knowledge base every minute to provide an extra layer of data safety.
setInterval(() => {
  saveKnowledgeBase();
}, 60 * 1000); // 60 seconds

export const addArticleToKnowledgeBase = async (fileName: string, fileContent: string): Promise<KnowledgeArticle> => {
    // Use Gemini to extract structured info
    const extractedData = await extractKnowledgeFromFile(fileName, fileContent);
    
    const newArticle: KnowledgeArticle = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...extractedData,
    };

    KNOWLEDGE_BASE.push(newArticle);
    saveKnowledgeBase();
    
    return newArticle;
};

/**
 * Searches the knowledge base for articles matching the query keywords.
 * @param query The user's search query.
 * @returns A promise that resolves to an array of matching knowledge articles.
 */
export const searchKnowledge = async (query: string): Promise<Omit<KnowledgeArticle, 'keywords'>[]> => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 300));

  if (!query.trim()) {
    return [];
  }

  const queryWords = query.toLowerCase().split(/\s+/);
  const matches: (KnowledgeArticle & { score: number })[] = [];

  KNOWLEDGE_BASE.forEach(article => {
    let currentScore = 0;
    article.keywords.forEach(keyword => {
      if (queryWords.some(word => keyword.toLowerCase().includes(word))) {
        currentScore++;
      }
    });
     // Also search title
    if (queryWords.some(word => article.title.toLowerCase().includes(word))) {
        currentScore += 2;
    }

    if (currentScore > 0) {
      matches.push({ ...article, score: currentScore });
    }
  });

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);

  // Return articles without keywords and score
  return matches.map(({ keywords, score, ...rest }) => rest);
};

export const getKnowledgeBase = (): KnowledgeArticle[] => {
    return [...KNOWLEDGE_BASE];
};

export const setKnowledgeBase = (newKnowledgeBase: KnowledgeArticle[]): void => {
    // A simple validation on the structure of the loaded data
    if (Array.isArray(newKnowledgeBase) && (newKnowledgeBase.length === 0 || 
        (typeof newKnowledgeBase[0].id === 'string' &&
         typeof newKnowledgeBase[0].title === 'string' &&
         typeof newKnowledgeBase[0].content === 'string' &&
         Array.isArray(newKnowledgeBase[0].keywords)))) {
        KNOWLEDGE_BASE = newKnowledgeBase;
        saveKnowledgeBase();
    } else {
        throw new Error("Invalid knowledge base file format. Ensure it's an array of articles with id, title, content, and keywords.");
    }
};
