import { ChatMessage } from '../database/repository';

export interface LLMResponse {
  text: string;
}

export interface LLMProvider {
  /**
   * Generates a text response from the underlying LLM given a conversation history.
   * 
   * @param systemPrompt The instructions for the agent behavior
   * @param messages Array of past messages leading up to the current turn
   */
  generateResponse(systemPrompt: string, messages: ChatMessage[]): Promise<LLMResponse>;
}
