import { app } from './app';
import { env } from './config/env';

console.log(`🚀 Server on ${env.DOMAIN}:${app.server?.port ?? 3000}`);
