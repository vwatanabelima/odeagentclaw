import { Context, NextFunction } from 'grammy';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Middleware to restrict access to the allowed User ID defined in the environment.
 */
export async function whitelistMiddleware(ctx: Context, next: NextFunction) {
  const allowedId = process.env.ALLOWED_USER_ID;

  if (!allowedId) {
    console.warn('[Security] ALLOWED_USER_ID is not set! The bot will allow anyone.');
    await next();
    return;
  }

  const userId = ctx.from?.id?.toString();

  if (userId === allowedId) {
    await next(); // Pass the request to the next handler
  } else {
    // Drop the message silently, or log the unauthorized access attempt
    console.warn(`[Security] Unauthorized access attempt from user ID: ${userId}`);
    // Optional: await ctx.reply('You are not authorized to interact with OdéAgent.'); 
  }
}
