const axios = require("axios");

let cachedToken = null;
let tokenExpiresAt = null;

async function getAccessToken() {
  const now = Date.now();

  // Si el token sigue vigente, reutilizarlo
  if (cachedToken && tokenExpiresAt && now < tokenExpiresAt) {
    return cachedToken;
  }

  // Generar nuevo Access Token con el Refresh Token
  const response = await axios.post(
    "https://accounts.zoho.com/oauth/v2/token",
    null,
    {
      params: {
        refresh_token: process.env.ZOHO_REFRESH_TOKEN,
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        grant_type: "refresh_token",
      },
    }
  );

  cachedToken = response.data.access_token;
  tokenExpiresAt = now + (response.data.expires_in - 60) * 1000; // 60s de margen

  return cachedToken;
}

module.exports = { getAccessToken };