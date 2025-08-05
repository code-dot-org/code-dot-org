import fs from 'fs';
import type {NextConfig} from 'next';
import path from 'path';

// For every package, copy over its public directory
const packageRoot = path.resolve(__dirname, '../../packages');
const packages = fs.readdirSync(packageRoot).filter(packageName => fs.statSync(path.join(packageRoot, packageName)).isDirectory() && fs.existsSync(path.join(packageRoot, packageName, 'src')));
const publicPaths = packages.map(packageName => path.resolve(__dirname, '../../packages', packageName, 'public')).filter(publicPath => fs.existsSync(publicPath));

const promises = [];

for (const source of publicPaths) {
  const target = path.resolve(__dirname, `public`);
  const parts = source.split('/');
  const packageName = parts[parts.length - 2];

    promises.push((async () => {
      try {
        console.log('copying', source, target);
        await fs.cp(source, target, {recursive: true, force: true}, () => {});
        console.log(`[next.config.ts] Copied public assets from ${packageName}.`);
      } catch (err) {
        console.warn(`[next.config.ts] Failed to copy public assets from ${packageName}.`, err);
      }
    })());
}

Promise.all(promises);

const nextConfig: NextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),
  serverExternalPackages: [],
  cacheMaxMemorySize: 0, // disable default in-memory caching
  experimental: {
    turbo: {
      rules: {
        // Support loading GLSL shaders
        '*.{glsl,vs,fs,vert,frag}': {
          loaders: ['raw-loader'],
          as: '*.js',
        },
      },
    },
  },
};

export default nextConfig;
