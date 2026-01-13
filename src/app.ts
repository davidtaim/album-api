import { Elysia } from 'elysia';
import { staticPlugin } from '@elysiajs/static';
import { cors } from '@elysiajs/cors';
import { env } from './config/env';
import { migrate } from './db/migrate';
import { healthModule } from './modules/health/health';
import { photosModule } from './modules/photos/photos';

migrate();

export const app = new Elysia()
    .use(staticPlugin())
    .use(cors())
    .use(healthModule)
    .use(photosModule)
    .listen(env.PORT);
