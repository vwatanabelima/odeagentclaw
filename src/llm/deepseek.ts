import OpenAI from 'openai';
import { LLMProvider, LLMResponse } from './provider';
import { ChatMessage } from '../database/repository';
import dotenv from 'dotenv';
dotenv.config();

// We use the openai package connected to DeepSeek servers
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || '',
});

export class DeepSeekProvider implements LLMProvider {
  private modelName: string;

  constructor(modelName: string = 'deepseek-chat') {
    this.modelName = modelName;
  }

  async generateResponse(systemPrompt: string, messages: ChatMessage[]): Promise<LLMResponse> {
    
    const formattedMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((m) => ({
        role: (m.role === 'assistant' ? 'assistant' : 'user') as "system" | "user" | "assistant",
        content: m.content
      }))
    ];

    const response = await openai.chat.completions.create({
      model: this.modelName,
      messages: formattedMessages,
    });

    return {
      text: response.choices[0].message?.content || '',
    };
  }
}
