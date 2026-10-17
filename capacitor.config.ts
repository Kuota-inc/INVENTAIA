import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.inventa.app',
  appName: 'Kuota',
  webDir: 'capacitor-www',
  server: {
    url: 'https://kuota-ia.vercel.app',
  },
  plugins: {
    SocialLogin: {
      providers: {
        google: true,
        facebook: false,
        apple: false,
        twitter: false,
      },
    },
  },
};

export default config;
