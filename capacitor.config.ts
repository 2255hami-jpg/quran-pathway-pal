import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.quranstudents',
  appName: 'متابعة حفظ القرآن',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
  },
};

export default config;
