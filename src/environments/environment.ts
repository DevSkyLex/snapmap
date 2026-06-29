// Environnement de développement (ionic serve).
// ⚠️ Remplacez les placeholders par vos vraies clés avant de lancer l'app.
export const environment = {
  production: false,

  // Backend Express qui crée les PaymentIntent Stripe.
  // En dev web : localhost. Sur un vrai device : http://IP_LOCALE:4000/ (voir PLAN.md).
  api: 'http://localhost:4000/',

  // Token PUBLIC Mapbox (commence par "pk."). À récupérer sur https://account.mapbox.com
  mapBox: {
    accessToken: 'pk.VOTRE_TOKEN_MAPBOX',
  },

  // Clé PUBLIABLE Stripe (commence par "pk_test_"). JAMAIS la clé secrète (sk_) ici.
  stripe: {
    publishableKey: 'pk_test_VOTRE_CLE_PUBLIQUE',
  },
};
