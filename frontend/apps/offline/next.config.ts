import fs from 'fs/promises';
import type {NextConfig} from 'next';
import path from 'path';

// Copy over blockly assets
const copyBlocklyAssets = async () => {
  const source = path.resolve(__dirname, '../../node_modules/blockly/media');
  const target = path.resolve(__dirname, 'public/blockly/media');

  // Cancel it if there is already the target path
  try {
    await fs.access(target);
    return;
  } catch (_) {
    // If this fails, then the directory doesn't exist.
    // Continue to copy it.
  }

  try {
    await fs.cp(source, target, {recursive: true, force: true});
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

  // Cancel it if there is already the target path
  try {
    await fs.access(target);
    return;
  } catch (_) {
    // If this fails, then the directory doesn't exist.
    // Continue to copy it.
  }

  try {
    await fs.cp(source, target, {recursive: true, force: true});
    console.log('[next.config.js] Copied Maze skin assets.');
  } catch (err) {
    console.warn('Failed to copy Maze skin assets:', err);
  }
};
copySkinAssets(); // This runs when Next.js starts (dev or build)

// Copy over craft support images
const copyCraftAssets = async () => {
  const source = path.resolve(__dirname, '../../../apps/static/craft');
  const target = path.resolve(__dirname, 'public/craft');

  // Cancel it if there is already the target path
  try {
    await fs.access(target);
    return;
  } catch (_) {
    // If this fails, then the directory doesn't exist.
    // Continue to copy it.
  }

  try {
    await fs.cp(source, target, {recursive: true, force: true});
    console.log('[next.config.js] Copied Craft skin assets.');
  } catch (err) {
    console.warn('Failed to copy Craft skin assets:', err);
  }
};
copyCraftAssets(); // This runs when Next.js starts (dev or build)

// Copy over common images
const copyCommonImageAssets = async () => {
  const source = path.resolve(__dirname, '../../../apps/static/common_images');
  const target = path.resolve(__dirname, 'public/blockly/media/common_images');

  // Cancel it if there is already the target path
  try {
    await fs.access(target);
    return;
  } catch (_) {
    // If this fails, then the directory doesn't exist.
    // Continue to copy it.
  }

  try {
    await fs.cp(source, target, {recursive: true, force: true});
    console.log('[next.config.js] Copied lab common image assets.');
  } catch (err) {
    console.warn('Failed to copy lab common image assets:', err);
  }
};
copyCommonImageAssets(); // This runs when Next.js starts (dev or build)

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
