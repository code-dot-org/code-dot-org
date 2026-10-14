import * as esbuild from 'esbuild';
import {execSync} from 'child_process';

const result = await esbuild.build({
  entryPoints: ['scripts/export-data.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: '/tmp/aitutor-export-data.cjs',
});

if (result.errors.length > 0) process.exit(1);

execSync('node /tmp/aitutor-export-data.cjs', {stdio: 'inherit', cwd: process.cwd()});
