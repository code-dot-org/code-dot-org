import type {CapacitorConfig} from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.codeai',
  appName: 'CodeAI',
  // Studio's mobile build; `yarn android:sync` builds it first.
  webDir: '../studio/dist-mobile',
  server: {
    appStartPath: '/launcher',
    // Hosts the app's WebView may navigate to. Keep in step with
    // ALLOWED_ORIGINS in MainActivity.kt, which ignores links to any other
    // host.
    allowNavigation: ['studio.code.org', 'support.code.org'],
  },
};

export default config;
