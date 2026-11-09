import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const watch = process.argv.includes('--watch');

function buildHtml(bundleJs) {
  const template = readFileSync('template.html', 'utf8');
  const output = template.replace('</body>', `<script>\n${bundleJs}\n</script>\n</body>`);
  mkdirSync('dist', { recursive: true });
  writeFileSync('dist/index.html', output);
  console.log('Built dist/index.html');
}

const ctx = await esbuild.context({
  entryPoints: ['src/main.ts'],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
  write: false,
  logLevel: 'info',
  plugins: [
    {
      name: 'html-injector',
      setup(build) {
        build.onEnd(result => {
          if (result.errors.length === 0) {
            const js = result.outputFiles[0].text;
            buildHtml(js);
          }
        });
      },
    },
  ],
});

if (watch) {
  await ctx.watch();
  // Trigger initial build
  await ctx.rebuild();
  console.log('Watching for changes...');
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
