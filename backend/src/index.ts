import cors from '@fastify/cors';
import 'dotenv/config';
import Fastify from 'fastify';
import { prismaPlugin } from './plugins/prisma.js';
import { healthRoutes } from './routes/health.js';
import { rootRoutes } from './routes/root.js';
import { searchRoutes } from './routes/search.js';
import { treeRoutes } from './routes/tree.js';

// Support both BACKEND_PORT (preferred) and PORT (for Render.com, Fly.io, etc.)
const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

const fastify = Fastify({
  logger:
    process.env.NODE_ENV === 'production'
      ? {
          level: process.env.LOG_LEVEL || 'info',
        }
      : {
          level: process.env.LOG_LEVEL || 'info',
          transport: {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
              colorize: true,
            },
          },
        },
});

async function start() {
  try {
    // Register plugins
    await fastify.register(cors, {
      origin:
        process.env.NODE_ENV === 'production'
          ? process.env.FRONTEND_URL ?? false
          : [/^http:\/\/localhost:(5173|4173)$/],  // Vite dev (5173) + preview/build (4173)
      credentials: true,
    });

    await fastify.register(prismaPlugin);

    await fastify.prisma.$connect();
    fastify.log.info('Prisma connected to database');

    // Register routes
    await fastify.register(rootRoutes);
    await fastify.register(healthRoutes);
    await fastify.register(treeRoutes, { prefix: '/api/tree' });
    await fastify.register(searchRoutes, { prefix: '/api/search' });

    fastify.ready(() => {
      fastify.log.info(`Routes registered:\n${fastify.printRoutes()}`);
    });

    // Start server
    await fastify.listen({ port: PORT, host: HOST });
    fastify.log.info(`Server listening on ${HOST}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
