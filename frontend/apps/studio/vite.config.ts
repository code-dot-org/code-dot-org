import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import ViteRails from 'vite-plugin-rails';

// https://vite.dev/config/
export default defineConfig(({mode}) => {
  const isDev = mode === 'development';

  return {
    server: {
      allowedHosts: isDev ? ['localhost-studio.code.org'] : undefined,
    },
    plugins: [
      ViteRails(),
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
    ],
  };
});
