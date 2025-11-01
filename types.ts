export enum Tab {
  Chat = 'chat',
  Search = 'search',
  Task = 'task',
  Think = 'think',
  Knowledge = 'knowledge',
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface GroundingChunk {
    web?: {
        uri: string;
        title: string;
    };
}

export interface SearchResult {
  text: string;
  sources: GroundingChunk[];
}