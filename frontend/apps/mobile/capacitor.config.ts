import type {CapacitorConfig} from '@capacitor/cli';

import {MobileAppName} from '@code-dot-org/shared-constants';

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
  plugins: {
    // Not a plugin: settings for the app's own native code, kept under the
    // name of the file that reads them, as a plugin's are under its name.
    WebViewSetup: {
      // The app's name in its WebView's User-Agent.
      userAgentProduct: MobileAppName,
    },
  },
};

export default config;
