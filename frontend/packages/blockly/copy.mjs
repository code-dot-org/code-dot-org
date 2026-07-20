import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

// Copy over blockly assets
const copyBlocklyAssets = async (subpath = 'public') => {
  const source = path.resolve(__dirname, '../../node_modules/blockly/media');
  const target = path.resolve(__dirname, `${subpath}/blockly/media`);

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
    console.log('[copy.ts] Copied Blockly media assets.');
  } catch (err) {
    console.warn('[copy.ts] Failed to copy Blockly assets:', err);
  }
};
copyBlocklyAssets(); // Copy to 'public'
copyBlocklyAssets('dist'); // Copy to 'dist'
