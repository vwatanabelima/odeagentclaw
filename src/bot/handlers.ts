import { Bot } from 'grammy';
import { mainAgent } from './agent';
import { whitelistMiddleware } from './middlewares';
import { transcribeTelegramVoice } from '../services/audio';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token || token === 'SEU_TOKEN_DO_TELEGRAM_AQUI') {
  console.error('[Bot Error] TELEGRAM_BOT_TOKEN is missing or contains placeholder. Please set it in .env');
  process.exit(1);
}

// Ensure the bot instance exists
export const bot = new Bot(token);

// 1. Hook the strict whitelist check
bot.use(whitelistMiddleware);

// 2. Base Commands
bot.command('start', (ctx) => {
  ctx.reply('Saudações. Eu sou OdéAgent (O Caçador Estratégico). Estou operando localmente no seu sistema.\nPara interagir, envie sua mensagem. /clear para limpar memória.\n/brain gemini ou /brain deepseek para trocar LLM.');
});

// 3. Audio Voice hook
bot.on('message:voice', async (ctx) => {
  const userId = ctx.from?.id?.toString() || 'unknown';
  
  // Inform the user we are processing audio
  const statusMsg = await ctx.reply('🎧 _Transcrevendo áudio..._', { parse_mode: 'Markdown' });
  await ctx.api.sendChatAction(ctx.chat.id, 'typing');

  try {
    // Grammy built-in file fetcher
    const file = await ctx.getFile();
    const fileUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;

    // Delegate to native LLM Audio service
    const transcript = await transcribeTelegramVoice(fileUrl);
    
    // Convert status msg to show the transcription
    await ctx.api.editMessageText(ctx.chat.id, statusMsg.message_id, `🗣️ _Você disse:_ \n"${transcript}"`, { parse_mode: 'Markdown' });
    
    // Re-trigger typing and proxy to agent
    await ctx.api.sendChatAction(ctx.chat.id, 'typing');
    const response = await mainAgent.processInput(userId, transcript);
    
    await ctx.reply(response);
  } catch (err: any) {
    console.error('[Audio Error]', err);
    await ctx.api.editMessageText(ctx.chat.id, statusMsg.message_id, `❌ Ocorreu um erro ao escutar seu áudio: ${err.message}`);
  }
});

// 4. Main Agent Text Hook
bot.on('message:text', async (ctx) => {
  const userId = ctx.from?.id?.toString() || 'unknown';
  const text = ctx.message.text;

  // Visual text loading state for user comfort (Telegram "typing..." action)
  await ctx.api.sendChatAction(ctx.chat.id, 'typing');

  try {
    const response = await mainAgent.processInput(userId, text);
    await ctx.reply(response);
  } catch (err: any) {
    console.error('[Bot Error]', err);
    await ctx.reply(`Ocorreu um erro no processamento: ${err.message}`);
  }
});

// Setup global error handling for Grammy
bot.catch((err) => {
  console.error(`Error while handling update ${err.ctx.update.update_id}:`);
});
