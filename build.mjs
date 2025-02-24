import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function buildServer() {
  try {
    await build({
      entryPoints: ['server/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outfile: 'dist/server.js',
      external: [
        // External packages that should not be bundled
        'express',
        'pg',
        'mongodb',
        'mongoose',
        '@neondatabase/serverless',
        'ws',
        ...Object.keys(JSON.parse(await fs.readFile('package.json', 'utf-8')).dependencies || {})
      ]
    });
    console.log('Server build complete');
  } catch (error) {
    console.error('Server build failed:', error);
    process.exit(1);
  }
}

// Execute builds
buildServer();
