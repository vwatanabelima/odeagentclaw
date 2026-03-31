import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Downloads a voice message from Telegram and uses Gemini 2.5 Flash 
 * (which natively processes audio) to heavily and accurately transcribe it into text.
 */
export async function transcribeTelegramVoice(fileUrl: string): Promise<string> {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio file from Telegram: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = buffer.toString('base64');

    // Gemini 2.5 Flash is extremely fast and accurate with Portuguese audio
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'audio/ogg', // Telegram voice messages are typically OGG format
          data: base64Audio,
        },
      },
      { 
        text: "Transcreva este áudio de forma literal e precisa. Se o áudio estiver em português, mantenha em PT-BR. IMPORTANTE: Devolva apenas o texto transcrito, sem introduções, aspas, ou explicações adicionais." 
      }
    ]);

    return result.response.text().trim();
  } catch (error) {
    console.error('[Audio Service] Error transcribing voice:', error);
    throw error;
  }
}
