import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import type {OutputOptions} from 'rollup';
import {defineConfig, type ViteDevServer} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';

function getRollupOutputConfig(format: 'es' | 'cjs'): OutputOptions {
  return {
    format,
    exports: 'auto',
    entryFileNames: format === 'es' ? '[name].mjs' : '[name].cjs',
    preserveModules: true,
    preserveModulesRoot: 'src',
  };
}

function serveCertificateTemplates() {
  const certificateRoot = path.resolve(
    __dirname,
    '../../../dashboard/public/blockly/media/certificates',
  );

  return {
    apply: 'serve' as const,
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        const prefix = '/blockly/media/certificates/';
        if (!req.url?.startsWith(prefix)) {
          next();
          return;
        }

        const filePath = path.join(
          certificateRoot,
          req.url.slice(prefix.length),
        );
        if (!fs.existsSync(filePath)) {
          res.statusCode = 404;
          res.end('Not found');
          return;
        }

        res.setHeader(
          'Content-Type',
          filePath.endsWith('.jpg') ? 'image/jpeg' : 'image/png',
        );
        res.end(fs.readFileSync(filePath));
      });
    },
    name: 'serve-certificate-templates',
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    serveCertificateTemplates(),
    dts({
      tsconfigPath: './tsconfig.json',
      rollupTypes: false,
      entryRoot: 'src',
      insertTypesEntry: false,
      exclude: [
        '**/__tests__/**',
        '**/*.test.tsx',
        'dev/**',
        'e2e/**',
        'src/setupTests.ts',
      ],
    }),
    externalizeDeps(),
  ],
  resolve: {
    alias: {'@': path.resolve(__dirname, './src')},
  },
  server: {
    allowedHosts: ['localhost-studio.code.org'],
    watch: {
      usePolling: true,
    },
  },
  build: {
    // public/ holds the MSW dev worker; keep it out of the lib output.
    copyPublicDir: false,
    sourcemap: true,
    cssCodeSplit: true,
    lib: {
      entry: ['src/index.ts'],
      name: 'certificates',
    },
    rollupOptions: {
      output: [getRollupOutputConfig('es'), getRollupOutputConfig('cjs')],
    },
  },
});
