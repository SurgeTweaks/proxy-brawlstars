const express = require("express");
const axios = require("axios");
const cors = require("cors");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

// === API Keys
const BRAWL_API_KEY = process.env.BRAWL_API_KEY;
const CLASH_API_KEY = process.env.CLASH_API_KEY;
const COC_API_KEY = process.env.COC_API_KEY;

// === Validation de tag
const isValidTag = (tag) => /^[A-Z0-9]{3,15}$/.test(tag.toUpperCase());

// === Handler erreur
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

// === BRAWL STARS
app.get("/api/brawl/:uid/:tag", async (req, res) => {
  const tag = req.params.tag.replace("#", "").toUpperCase();
  const uid = req.params.uid;
  if (!isValidTag(tag)) return res.status(400).json({ error: "Tag invalide", success: false });

  const cacheKey = `brawl-${tag}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ uid, data: cached, cached: true, success: true });

  try {
    console.log(`🎮 Brawl Stars - UID: ${uid}, Tag: #${tag}`);
    const { data } = await axios.get(`https://api.brawlstars.com/v1/players/%23${tag}`, {
      headers: { Authorization: `Bearer ${BRAWL_API_KEY}` },
      timeout: 10000
    });
    cache.set(cacheKey, data);
    res.json({ uid, data, success: true });
  } catch (error) {
    const errorInfo = handleApiError(error, 'Brawl Stars');
    res.status(errorInfo.status).json({ uid, error: errorInfo.message, details: errorInfo.details, success: false });
  }
});

// === CLASH ROYALE
app.get("/api/clash/:uid/:tag", async (req, res) => {
  const tag = req.params.tag.replace("#", "").toUpperCase();
  const uid = req.params.uid;
  if (!isValidTag(tag)) return res.status(400).json({ error: "Tag invalide", success: false });

  const cacheKey = `clash-${tag}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ uid, data: cached, cached: true, success: true });

  try {
    console.log(`👑 Clash Royale - UID: ${uid}, Tag: #${tag}`);
    const { data } = await axios.get(`https://api.clashroyale.com/v1/players/%23${tag}`, {
      headers: { Authorization: `Bearer ${CLASH_API_KEY}` },
      timeout: 10000
    });
    cache.set(cacheKey, data);
    res.json({ uid, data, success: true });
  } catch (error) {
    const errorInfo = handleApiError(error, 'Clash Royale');
    res.status(errorInfo.status).json({ uid, error: errorInfo.message, details: errorInfo.details, success: false });
  }
});

// === CLASH OF CLANS
app.get("/api/clashofclans/:uid/:tag", async (req, res) => {
  const tag = req.params.tag.replace("#", "").toUpperCase();
  const uid = req.params.uid;
  if (!isValidTag(tag)) return res.status(400).json({ error: "Tag invalide", success: false });

  const cacheKey = `coc-${tag}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json({ uid, data: cached, cached: true, success: true });

  try {
    console.log(`🏰 Clash of Clans - UID: ${uid}, Tag: #${tag}`);
    const { data } = await axios.get(`https://api.clashofclans.com/v1/players/%23${tag}`, {
      headers: { Authorization: `Bearer ${COC_API_KEY}` },
      timeout: 10000
    });
    cache.set(cacheKey, data);
    res.json({ uid, data, success: true });
  } catch (error) {
    const errorInfo = handleApiError(error, 'Clash of Clans');
    res.status(errorInfo.status).json({ uid, error: errorInfo.message, details: errorInfo.details, success: false });
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

// === Mon IP
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

// === 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: `Route non trouvée: ${req.method} ${req.originalUrl}`,
    success: false
  });
});

// === Erreurs globales
app.use((error, req, res, next) => {
  console.error('❌ Erreur serveur:', error);
  res.status(500).json({
    error: 'Erreur serveur interne',
    success: false
  });
});

// === Start
app.listen(PORT, () => {
  console.log(`✅ Serveur actif sur le port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// === SIGTERM Render
process.on('SIGTERM', () => {
  console.log('🔄 Arrêt du serveur...');
  process.exit(0);
});