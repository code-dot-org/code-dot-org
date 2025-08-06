import fs from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

/* The normal build will pump out, unchanged, an AMD relative import from some
 * Blockly code. It then expects that the blockly files (blockly_compressed.js)
 * exist relative to our own library instead of it.
 *
 * So, we create those files.
 */

// Create dummy Blockly files
const fixBlocklyImport = async (subpath = 'public') => {
  const target = path.resolve(__dirname, `${subpath}/blockly_compressed.js`);

  // Cancel it if there is already the target path
  try {
    await fs.access(target);
    return;
  } catch (_) {
    // If this fails, then the directory doesn't exist.
    // Continue to copy it.
  }

  try {
    await fs.writeFile(target, '');
    console.log(`[fix.mjs] Created ${target}`);
  } catch (err) {
    console.warn(`[fix.mjs] Failed to create ${target}`, err);
  }
};
await fixBlocklyImport('dist/cjs'); // Copy to 'dist/cjs'
await fixBlocklyImport('dist/esm'); // Copy to 'dist/esm'
