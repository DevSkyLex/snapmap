import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.snapmap.app',
  appName: 'SnapMap',
  webDir: 'www',
  // Le backend Stripe local est servi en HTTP clair sur le LAN (ex.
  // http://192.168.1.15:4000). Par défaut Capacitor sert la WebView en
  // https://localhost, ce qui bloque l'appel (mixed content + cleartext interdit).
  // On sert donc l'app en http://localhost et on autorise le trafic en clair.
  server: {
    androidScheme: 'http',
    cleartext: true,
  },
};

export default config;
