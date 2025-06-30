const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const BRAWL_API_KEY = process.env.BRAWL_API_KEY;
const CLASH_API_KEY = process.env.CLASH_API_KEY;
const COC_API_KEY = process.env.COC_API_KEY;
const FORTNITE_API_KEY = process.env.FORTNITE_API_KEY;

// Middleware de gestion d'erreurs
const handleApiError = (error, game) => {
  console.error(`❌ Erreur API ${game}:`, error.message);

  if (error.response) {
    return {
      status: error.response.status,
      message: `Erreur ${game}: ${error.response.status}`,
      details: error.response.data
    };
  }

  return {
    status: 500,
    message: `Erreur serveur ${game}`,
    details: error.message
  };
};

// === BRAWL STARS (Route corrigée)
app.get("/api/player/:uid/:tag", async (req, res) => {
  const tag = req.params.tag.replace("#", "").toUpperCase();
  const uid = req.params.uid;

  try {
    console.log(`🎮 Brawl Stars - UID: ${uid}, Tag: #${tag}`);

    const { data } = await axios.get(`https://api.brawlstars.com/v1/players/%23${tag}`, {
      headers: { Authorization: `Bearer ${BRAWL_API_KEY}` },
      timeout: 10000
    });

    res.json({ uid, data, success: true });
  } catch (error) {
    const errorInfo = handleApiError(error, 'Brawl Stars');
    res.status(errorInfo.status).json({
      uid,
      error: errorInfo.message,
      details: errorInfo.details,
      success: false
    });
  }
});

// === CLASH ROYALE
app.get("/api/clash/:uid/:tag", async (req, res) => {
  const tag = req.params.tag.replace("#", "").toUpperCase();
  const uid = req.params.uid;

  try {
    console.log(`👑 Clash Royale - UID: ${uid}, Tag: #${tag}`);

    const { data } = await axios.get(`https://api.clashroyale.com/v1/players/%23${tag}`, {
      headers: { Authorization: `Bearer ${CLASH_API_KEY}` },
      timeout: 10000
    });

    res.json({ uid, data, success: true });
  } catch (error) {
    const errorInfo = handleApiError(error, 'Clash Royale');
    res.status(errorInfo.status).json({
      uid,
      error: errorInfo.message,
      details: errorInfo.details,
      success: false
    });
  }
});

// === CLASH OF CLANS
app.get("/api/clashofclans/:uid/:tag", async (req, res) => {
  const tag = req.params.tag.replace("#", "").toUpperCase();
  const uid = req.params.uid;

  try {
    console.log(`🏰 Clash of Clans - UID: ${uid}, Tag: #${tag}`);

    const { data } = await axios.get(`https://api.clashofclans.com/v1/players/%23${tag}`, {
      headers: { Authorization: `Bearer ${COC_API_KEY}` },
      timeout: 10000
    });

    res.json({ uid, data, success: true });
  } catch (error) {
    const errorInfo = handleApiError(error, 'Clash of Clans');
    res.status(errorInfo.status).json({
      uid,
      error: errorInfo.message,
      details: errorInfo.details,
      success: false
    });
  }
});


// === FORTNITE - Rank compétitif via fortniteapi.io
app.get("/api/fortnite/:uid/:username", async (req, res) => {
  const { uid, username } = req.params;
  try {
    console.log(`🎮 Fortnite - UID: ${uid}, Pseudo: ${username}`);

    // Étape 1 : lookup pour obtenir l'account_id
    const lookupRes = await axios.get("https://fortniteapi.io/v1/lookup", {
      params: { username },
      headers: { Authorization: FORTNITE_API_KEY },
      timeout: 10000
    });

    if (!lookupRes.data || !lookupRes.data.account_id) {
      return res.status(404).json({ uid, error: "Joueur introuvable", success: false });
    }

    const accountId = lookupRes.data.account_id;

    // Étape 2 : récupération des stats compétitives
    const statsRes = await axios.get("https://fortniteapi.io/v1/stats", {
      params: { account: accountId },
      headers: { Authorization: FORTNITE_API_KEY },
      timeout: 10000
    });

    const stats = statsRes.data.global_stats || {};
    const result = {
      rank_name: stats.rank_name || "Non classé",
      rank: stats.rank || 0,
      win_rate: stats.win_rate || 0,
      matches: stats.matchesplayed || 0
    };

    res.json({ uid, data: result, success: true });

  } catch (error) {
    const errorInfo = handleApiError(error, 'Fortnite');
    res.status(errorInfo.status).json({
      uid,
      error: errorInfo.message,
      details: errorInfo.details,
      success: false
    });
  }
});


// === Health Check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// === Test IP
app.get("/my-ip", async (req, res) => {
  try {
    const ip = await axios.get("https://api64.ipify.org?format=json", { timeout: 5000 });
    res.json({ ip: ip.data.ip, success: true });
  } catch (err) {
    res.status(500).json({
      error: "Impossible de récupérer l'IP",
      success: false
    });
  }
});

// Middleware 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: `Route non trouvée: ${req.method} ${req.originalUrl}`,
    success: false
  });
});

// Middleware de gestion d'erreurs globales
app.use((error, req, res, next) => {
  console.error('❌ Erreur serveur:', error);
  res.status(500).json({
    error: 'Erreur serveur interne',
    success: false
  });
});

app.listen(PORT, () => {
  console.log(`✅ Serveur actif sur le port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Gestion propre de la fermeture
process.on('SIGTERM', () => {
  console.log('🔄 Arrêt du serveur...');
  process.exit(0);
});