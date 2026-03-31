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

    // Format previous messages per Gemini spec. Gemini requires strict alternating 'user' / 'model' roles, starting with 'user'.
    const validHistory: any[] = [];
    let expectedRole = 'user';

    for (const msg of messages.slice(0, -1)) {
      const mappedRole = msg.role === 'assistant' ? 'model' : 'user';
      if (validHistory.length === 0 && mappedRole === 'model') {
        // Skip leading model messages until we find a user message
        continue;
      }

      if (mappedRole === expectedRole) {
        validHistory.push({ role: mappedRole, parts: [{ text: msg.content }] });
        expectedRole = expectedRole === 'user' ? 'model' : 'user';
      } else if (validHistory.length > 0) {
        // Combine consecutive messages of the same role to satisfy Gemini's strict alternation rules
        validHistory[validHistory.length - 1].parts[0].text += '\n\n' + msg.content;
      }
    }

    // History before a new 'user' sendMessage() MUST end with 'model'
    if (validHistory.length > 0 && validHistory[validHistory.length - 1].role === 'user') {
      validHistory.pop();
    }

    // The very last message is the current one
    const latestMessage = messages[messages.length - 1];
    
    // Start Chat
    const chat = model.startChat({
      history: validHistory,
    });

    const result = await chat.sendMessage(latestMessage.content);
    return {
      text: result.response.text(),
    };
  }
}
