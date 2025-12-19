import { FastifyPluginAsync } from 'fastify';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

interface RootResponse {
  version: string;
}

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Cache version at module load time to avoid reading file on every request
let version: string = 'unknown';
try {
  const packageJsonContent = readFileSync(join(__dirname, '../../package.json'), 'utf-8');
  const packageJson = JSON.parse(packageJsonContent) as { version: string };
  version = packageJson.version;
} catch {
  // Version remains 'unknown' if file read fails
}

export const rootRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Reply: RootResponse }>('/', async (): Promise<RootResponse> => {
    return {
      version,
    };
  });
};
