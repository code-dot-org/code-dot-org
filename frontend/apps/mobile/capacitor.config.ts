import type {CapacitorConfig} from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.codeai',
  appName: 'CodeAI',
  webDir: '../studio/dist',
  server: {
    // Hosts the app's WebView may navigate to. Keep in step with
    // ALLOWED_ORIGINS in MainActivity.kt, which ignores links to any other
    // host.
    allowNavigation: ['studio.code.org', 'support.code.org'],
  },
};

export default config;
