import type {CapacitorConfig} from '@capacitor/cli';

// Capacitor wraps the Vite-built mobile bundle as native iOS and Android
// binaries. `webDir` points at the output of `yarn build:mobile`; that
// build uses `base: './'` so the in-app file:// URL resolves all assets
// correctly inside the WebView.
const config: CapacitorConfig = {
  appId: 'org.code.studio',
  appName: 'Code Studio',
  webDir: 'dist',
  bundledWebRuntime: false,
  ios: {
    contentInset: 'never',
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
