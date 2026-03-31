import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider, LLMResponse } from './provider';
import { ChatMessage } from '../database/repository';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class GeminiProvider implements LLMProvider {
  private modelName: string;

  constructor(modelName: string = 'gemini-2.5-flash') {
    this.modelName = modelName;
  }

  async generateResponse(systemPrompt: string, messages: ChatMessage[]): Promise<LLMResponse> {
    const model = genAI.getGenerativeModel({ model: this.modelName, systemInstruction: systemPrompt });

    // Format previous messages per Gemini spec
    // Note: Gemini distinguishes between 'user' and 'model'
    const history = messages.slice(0, -1).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // The very last message is the current one
    const latestMessage = messages[messages.length - 1];
    
    // Start Chat
    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessage(latestMessage.content);
    return {
      text: result.response.text(),
    };
  }
}
