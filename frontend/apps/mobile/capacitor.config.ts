import type {CapacitorConfig} from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.codeai',
  appName: 'CodeAI',
  // Studio's mobile build; `yarn android:sync` builds it first.
  webDir: '../studio/dist-mobile',
  server: {
    // dsco.code.org grants this origin CORS, so the landing page's icon fonts
    // load and the WebView caches them.
    hostname: 'codeai-mobile-app.localhost',
    appStartPath: '/launcher',
    // The only host the app's WebView shows. Keep in step with SITE_ORIGIN in
    // SitePolicy.kt; MainActivity.kt ignores links to any other host.
    allowNavigation: ['studio.code.org'],
  },
};

export default config;
