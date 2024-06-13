import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {resolve} from "path";
import dts from 'vite-plugin-dts'
import {libInjectCss} from "vite-plugin-lib-inject-css";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts(), libInjectCss()],
  build: {
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      formats: ['cjs']
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime'],
    }
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, './src'),
      "color": resolve(__dirname, '../../../shared/css/color.scss'),
      "color.scss": resolve(__dirname, '../../../shared/css/color.scss'),
      "font": resolve(__dirname, '../../../shared/css/font.scss'),
      "font.scss": resolve(__dirname, '../../../shared/css/font.scss')
    }
  },

})
