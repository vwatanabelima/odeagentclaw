import { LLMProvider } from './provider';
import { GeminiProvider } from './gemini';
import { DeepSeekProvider } from './deepseek';

export type LLMType = 'gemini-flash' | 'deepseek';

export class LLMManager {
  private activeProvider: LLMProvider;
  private currentType: LLMType;

  constructor(initialType: LLMType = 'gemini-flash') {
    this.currentType = initialType;
    this.activeProvider = this.createProvider(initialType);
  }

  private createProvider(type: LLMType): LLMProvider {
    switch(type) {
      case 'deepseek':
        return new DeepSeekProvider('deepseek-chat');
      case 'gemini-flash':
      default:
        // High speed, lightweight model for audio, social media, and chat
        return new GeminiProvider('gemini-flash-latest');
    }
  }

  public setProvider(type: LLMType): void {
    if (type !== this.currentType) {
      this.currentType = type;
      this.activeProvider = this.createProvider(type);
      console.log(`[LLMManager] Switched to ${type}`);
    }
  }

  public getProvider(): LLMProvider {
    return this.activeProvider;
  }
  
  public getActiveType(): LLMType {
    return this.currentType;
  }
}

// Export a singleton instance
export const llmManager = new LLMManager();
