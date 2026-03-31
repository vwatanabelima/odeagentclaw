import { llmManager, LLMType } from '../llm/index';
import { saveMessage, getHistory, clearHistory } from '../database/repository';
import { skillLoader } from '../skills/loader';

const SYSTEM_PROMPT = `
You are OdéAgent (O Caçador Estratégico), a practical, results-driven, encouraging, and direct-to-the-point AI assistant.
You operate entirely in an environment designed for maximum privacy, running locally. Your output goes strictly to the authorized user via Telegram.
Respond concisely and efficiently.
`;

export class Agent {
  /**
   * Main interaction loop. Processes incoming text and returns the agent's reply.
   */
  public async processInput(sessionId: string, userInput: string): Promise<string> {
    
    // Commands to the AI
    if (userInput.toLowerCase().startsWith('/clear')) {
      clearHistory(sessionId);
      return 'History cleared. Ready for a new task.';
    }

    // Command to change brain
    if (userInput.toLowerCase().startsWith('/brain')) {
      const parts = userInput.split(' ');
      const newBrain = parts[1]?.toLowerCase();
      if (newBrain === 'flash' || newBrain === 'deepseek') {
        const typeMap: Record<string, LLMType> = {
            'flash': 'gemini-flash',
            'deepseek': 'deepseek'
        };
        llmManager.setProvider(typeMap[newBrain]);
        return `🧠 Cérebro alterado com sucesso! Agora operando no modo: ${newBrain.toUpperCase()}`;
      }
      return `Modo atual: ${llmManager.getActiveType()}.\nUse:\n/brain flash (Áudios, Rápido, Grátis)\n/brain deepseek (Inteligência, Código, Pago)`;
    }

    // 1. Save input to memory
    saveMessage(sessionId, 'user', userInput);

    // 2. Retrieve conversation context
    const history = getHistory(sessionId, 20); // last 20 messages

    // 3. Optional: Map skills (For future LLM API Tool formatting)
    const skills = skillLoader.getAvailableSkills();
    const skillsList = skills.map(s => s.name).join(', ');

    // 4. Generate Response using current LLM Provider
    // Injecting skills awareness into prompt since full function calling isn't strictly defined yet
    const prompt = `${SYSTEM_PROMPT}\nAvailable skills: ${skillsList ? skillsList : 'none'}`;
    
    try {
      const provider = llmManager.getProvider();
      const response = await provider.generateResponse(prompt, history);

      // 5. Save output to memory
      saveMessage(sessionId, 'assistant', response.text);

      return response.text;
    } catch (e: any) {
      console.error('[Agent Error]', e);
      return `Error generating response: ${e.message}`;
    }
  }
}

export const mainAgent = new Agent();
