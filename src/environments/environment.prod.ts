// Environnement de production (utilisé par `ionic build` / `ng build`).
// Pour ce concours, mettez les MÊMES clés que dans environment.ts (cf. sujet).
export const environment = {
  production: true,
  api: 'http://192.168.1.15:4000/',
  mapBox: {
    accessToken: '',
  },
  stripe: {
    publishableKey: '',
  },
};
