import type {CapacitorConfig} from '@capacitor/cli';

const config: CapacitorConfig = {
  // Temporary internal testing identity; release identity is supplied in Gradle.
  appId: process.env.FIRE_TABLET_APP_ID ?? 'org.code.firetablet.debug',
  appName: process.env.FIRE_TABLET_APP_NAME ?? 'Studio (internal test)',
  webDir: 'dist',
  android: {allowMixedContent: false, webContentsDebuggingEnabled: false},
};

export default config;
