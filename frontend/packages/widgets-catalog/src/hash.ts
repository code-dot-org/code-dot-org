import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

function sha256Prefixed(hash: ReturnType<typeof createHash>): string {
  return `sha256:${hash.digest('hex')}`;
}

function listFilesRecursive(dir: string, relPrefix = ''): string[] {
  const entries = fs.readdirSync(dir, {withFileTypes: true});
  const files: string[] = [];
  for (const entry of entries) {
    // Forward-slash join regardless of platform, so the hash does not
    // depend on which OS produced it.
    const rel = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...listFilesRecursive(path.join(dir, entry.name), rel));
    } else if (entry.isFile()) {
      files.push(rel);
    }
  }
  return files;
}

/**
 * A single hash over a widget's entire `src/` tree: sorted relative paths,
 * each path and its content fed into the digest with a NUL separator so a
 * rename (same bytes, different path) hashes differently than a pure content
 * change. This is `widget.json`'s `sourceHash` — the reproducibility gate
 * (`test:gates`) rebuilds from disk and asserts this matches what is
 * recorded, catching a source edit that was never followed by
 * `widgets:rehash`.
 */
export function hashWidgetSource(srcDir: string): string {
  const files = listFilesRecursive(srcDir).sort();
  const hash = createHash('sha256');
  for (const relPath of files) {
    hash.update(relPath);
    hash.update('\0');
    hash.update(fs.readFileSync(path.join(srcDir, relPath)));
    hash.update('\0');
  }
  return sha256Prefixed(hash);
}

/** `widget.json`'s `docHash` — over the SERVED document (post injectWidgetChrome), same shape the reproducibility gate rebuilds and compares. */
export function hashWidgetDoc(servedHtml: string): string {
  return sha256Prefixed(createHash('sha256').update(servedHtml, 'utf8'));
}
