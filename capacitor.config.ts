import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.liferpg.lifeos',
  appName: '人生RPG · LifeOS',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    HealthFitness: {
      androidPermissions: [
        'READ_STEPS',
        'READ_TOTAL_CALORIES_BURNED',
        'READ_ACTIVE_CALORIES_BURNED',
        'READ_SLEEP',
        'READ_HEART_RATE',
      ],
    },
  },
};

export default config;
