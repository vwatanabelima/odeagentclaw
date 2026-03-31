import { LLMProvider } from './provider';
import { GeminiProvider } from './gemini';
import { DeepSeekProvider } from './deepseek';

export type LLMType = 'gemini' | 'deepseek';

export class LLMManager {
  private activeProvider: LLMProvider;
  private currentType: LLMType;

  constructor(initialType: LLMType = 'gemini') {
    this.currentType = initialType;
    this.activeProvider = this.createProvider(initialType);
  }

  private createProvider(type: LLMType): LLMProvider {
    switch(type) {
      case 'deepseek':
        // Defaulting to deepseek-chat but could be configurable
        return new DeepSeekProvider('deepseek-chat');
      case 'gemini':
      default:
        // Defaulting to gemini-2.5-flash
        return new GeminiProvider('gemini-2.5-flash');
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
