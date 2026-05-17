import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pakdad.splittr',
  appName: 'splittr',
  webDir: 'dist',
  ios: {
    infoPlist: {
      NSCameraUsageDescription: 'We need camera access to scan your receipts.',
    },
  },
};

export default config;
