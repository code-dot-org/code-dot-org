import type {CapacitorConfig} from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.codeai',
  appName: 'CodeAI',
  // Studio's mobile build; `yarn android:sync` builds it first.
  webDir: '../studio/dist-mobile',
  server: {
    appStartPath: '/launcher',
    // The only host the app's WebView shows. Keep in step with SITE_ORIGIN in
    // SitePolicy.kt; MainActivity.kt ignores links to any other host.
    allowNavigation: ['studio.code.org'],
  },
};

export default config;
