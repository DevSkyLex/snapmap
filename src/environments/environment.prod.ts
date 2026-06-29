// Environnement de production (utilisé par `ionic build` / `ng build`).
// Pour ce concours, mettez les MÊMES clés que dans environment.ts (cf. sujet).
export const environment = {
  production: true,

  api: 'http://localhost:4000/',

  mapBox: {
    accessToken: 'pk.VOTRE_TOKEN_MAPBOX',
  },

  stripe: {
    publishableKey: 'pk_test_VOTRE_CLE_PUBLIQUE',
  },
};
