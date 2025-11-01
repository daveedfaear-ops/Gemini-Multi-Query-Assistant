import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
import { ChatMessage, SearchResult } from '../types';

const getAiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const createChatSession = (): Chat => {
  const ai = getAiClient();
  return ai.chats.create({ 
    model: 'gemini-2.5-flash',
    config: {
      thinkingConfig: { thinkingBudget: 24576 },
    },
  });
};

export const runChat = async (chat: Chat, prompt: string, history: ChatMessage[]): Promise<string> => {
  // Although `chat` object maintains history, we can pass it explicitly if needed.
  // For this implementation, we rely on the stateful `chat` object.
  const response: GenerateContentResponse = await chat.sendMessage({ message: prompt });
  return response.text;
};

export const runSearch = async (prompt: string): Promise<SearchResult> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      thinkingConfig: { thinkingBudget: 24576 },
    },
  });

  const text = response.text;
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  return { text, sources: groundingChunks };
};

export const runTask = async (prompt: string, model: 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gemini-flash-lite-latest'): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
  });
  return response.text;
};

export const runThinking = async (prompt: string): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
    },
  });
  return response.text;
};

export const runKnowledgeQuery = async (prompt: string, context: string): Promise<string> => {
  const ai = getAiClient();
  const augmentedPrompt = `Based on the following information from our knowledge base, please answer the user's question. If the information doesn't contain the answer, say that you couldn't find relevant information.

---
Knowledge Base Information:
${context || 'No specific information was found in the knowledge base.'}
---

User's Question:
${prompt}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: augmentedPrompt,
  });
  return response.text;
};

export const extractKnowledgeFromFile = async (fileName: string, fileContent: string): Promise<{ title: string; content: string; keywords: string[] }> => {
  const ai = getAiClient();
  const prompt = `Analyze the following text content from a file named "${fileName}". 
  1. Create a concise, descriptive title for this content.
  2. Write a clear summary of the content, approximately 100-150 words long.
  3. Generate an array of 5-7 relevant keywords that can be used to search for this document.
  
  Text Content:
  ---
  ${fileContent.substring(0, 20000)}
  ---
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          keywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["title", "content", "keywords"],
      },
    },
  });

  try {
    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    return parsed;
  } catch (e) {
    console.error("Failed to parse JSON response from Gemini:", response.text);
    throw new Error("Failed to process file content. The AI's response was not valid JSON.");
  }
};