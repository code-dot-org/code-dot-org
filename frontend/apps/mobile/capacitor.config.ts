import type {CapacitorConfig} from '@capacitor/cli';

/**
 * Capacitor configuration for the Code.org mobile shell.
 *
 * webDir points directly at the studio workspace's build output. No copy,
 * no symlink, no intermediate www/ — `cap sync` reads ../studio/dist and
 * bakes the files into the native iOS/Android shells.
 *
 * Fallback path if the cross-workspace `webDir` ever breaks: create a
 * symlink `frontend/apps/mobile/www -> ../studio/dist` and change webDir
 * to `'www'`. Last resort is a copy script. Documented in README.md.
 *
 * `includePlugins` is REQUIRED in a Turborepo monorepo: the Capacitor CLI
 * walks node_modules to discover plugins, and hoisted dependencies trip
 * that scan. Listing them explicitly avoids the false-positive scan.
 */
const config: CapacitorConfig = {
  appId: 'org.code.studio',
  appName: 'Code.org',
  webDir: '../studio/dist',
  includePlugins: [
    '@capacitor/app',
    '@capacitor/keyboard',
    '@capacitor/preferences',
  ],
  server: {
    androidScheme: 'https',
  },
};

export default config;
