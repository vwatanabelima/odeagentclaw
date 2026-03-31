import { Bot } from 'grammy';
import { mainAgent } from './agent';
import { whitelistMiddleware } from './middlewares';
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

// 3. Main Agent Hook
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
  const e = err.error;
  console.error(e);
});
