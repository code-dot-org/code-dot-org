import fs from 'fs/promises';
import type {NextConfig} from 'next';
import path from 'path';

// Copy over blockly assets
const copyBlocklyAssets = async () => {
  const source = path.resolve(__dirname, '../../node_modules/blockly/media');
  const target = path.resolve(__dirname, 'public/blockly/media');

  try {
    await fs.cp(source, target, {recursive: true, overwrite: true});
    console.log('[next.config.js] Copied Blockly media assets.');
  } catch (err) {
    console.warn('Failed to copy Blockly assets:', err);
  }
};
copyBlocklyAssets(); // This runs when Next.js starts (dev or build)

// Copy over skins
const copySkinAssets = async () => {
  const source = path.resolve(__dirname, '../../../apps/static/skins');
  const target = path.resolve(__dirname, 'public/skins');

  try {
    await fs.cp(source, target, {recursive: true, overwrite: true});
    console.log('[next.config.js] Copied Maze skin assets.');
  } catch (err) {
    console.warn('Failed to copy Maze skin assets:', err);
  }
};
copySkinAssets(); // This runs when Next.js starts (dev or build)

const nextConfig: NextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  serverExternalPackages: [],
  cacheMaxMemorySize: 0, // disable default in-memory caching
};

export default nextConfig;
