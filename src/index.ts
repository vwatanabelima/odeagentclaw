import { bot } from './bot/handlers';
import './database/db'; // Initializes DB on boot
import dotenv from 'dotenv';
dotenv.config();

/**
 * Bootstraps OdéAgent, initializing database, skills, and starting the Telegram long-polling loop.
 */
const bootstrap = async () => {
  console.log('[System] Booting OdéAgent architecture...');
  try {
    // Start listening on Telegram
    await bot.start({
      onStart(botInfo) {
        console.log(`[Telegram] Successfully connected as @${botInfo.username}`);
      },
    });
  } catch (error) {
    console.error('[System Crash] Failed to initialize bot', error);
  }
};

bootstrap();

// Graceful shutdown handling
process.once('SIGINT', () => bot.stop());
process.once('SIGTERM', () => bot.stop());
