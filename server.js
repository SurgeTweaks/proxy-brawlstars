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
const RIOT_API_KEY = process.env.RIOT_API_KEY;

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

// === LEAGUE OF LEGENDS
app.get("/api/lol/:uid/:summonerName", async (req, res) => {
  const { uid, summonerName } = req.params;
  
  try {
    console.log(`🧠 League of Legends - UID: ${uid}, Summoner: ${summonerName}`);
    
    const { data } = await axios.get(
      `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`,
      {
        headers: { "X-Riot-Token": RIOT_API_KEY },
        timeout: 10000
      }
    );
    
    res.json({ uid, data, success: true });
  } catch (error) {
    const errorInfo = handleApiError(error, 'League of Legends');
    res.status(errorInfo.status).json({ 
      uid, 
      error: errorInfo.message, 
      details: errorInfo.details,
      success: false 
    });
  }
});

// === Valorant Competitive Rank - VERSION CORRIGÉE
app.get("/api/valorant/rank/:uid/:puuid", async (req, res) => {
  const { uid, puuid } = req.params;

  try {
    console.log(`🏆 Valorant Rank - UID: ${uid}, PUUID: ${puuid}`);

    // NOUVELLE URL CORRIGÉE pour l'API Henrik Dev
    const apiUrl = `https://api.henrikdev.xyz/valorant/v1/by-puuid/mmr/eu/${encodeURIComponent(puuid)}`;
    console.log(`🔗 URL API: ${apiUrl}`);
    
    const { data } = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'YourApp/1.0',
        'Accept': 'application/json'
      },
      timeout: 15000
    });

    // Vérification si l'API retourne des données valides
    if (!data || data.status !== 200) {
      throw new Error(`API Henrik Dev retourne: ${data?.status || 'Erreur inconnue'}`);
    }

    const result = {
      rank: data.data?.currenttierpatched || "Non classé",
      elo: data.data?.elo || 0,
      ranking_in_tier: data.data?.ranking_in_tier || 0,
      mmr_change: data.data?.mmr_change_to_last_game || 0,
      games_needed_for_rating: data.data?.games_needed_for_rating || 0
    };

    console.log(`✅ Rang récupéré: ${result.rank} (${result.elo} ELO)`);
    res.json({ uid, data: result, success: true });

  } catch (error) {
    console.error("❌ Valorant rank API error:", error.message);
    
    // Gestion d'erreur plus précise
    if (error.response) {
      console.error(`Status: ${error.response.status}, Data:`, error.response.data);
      
      // Si c'est une erreur 404, le joueur n'est pas classé
      if (error.response.status === 404) {
        return res.json({ 
          uid, 
          data: { 
            rank: "Non classé", 
            elo: 0, 
            ranking_in_tier: 0 
          }, 
          success: true 
        });
      }
    }
    
    const errorInfo = handleApiError(error, 'Valorant Rank');
    res.status(errorInfo.status).json({ 
      uid, 
      error: errorInfo.message, 
      details: errorInfo.details,
      success: false 
    });
  }
});

// === Route Valorant Account - AUSSI CORRIGÉE
app.get("/api/valorant/:uid/:riotId", async (req, res) => {
  const { uid, riotId } = req.params;
  const decodedRiotId = decodeURIComponent(riotId);
  const [gameName, tagLine] = decodedRiotId.split("#");

  if (!gameName || !tagLine) {
    return res.status(400).json({ 
      uid,
      error: "Format Riot ID invalide (attendu: nom#tag)", 
      success: false 
    });
  }

  try {
    console.log(`🎯 Valorant Account - UID: ${uid}, RiotID: ${decodedRiotId}`);
    
    // CHOIX 1: Utiliser l'API Henrik Dev (GRATUITE et plus fiable)
    const henrikUrl = `https://api.henrikdev.xyz/valorant/v1/account/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    
    const { data } = await axios.get(henrikUrl, {
      headers: {
        'User-Agent': 'YourApp/1.0',
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    // Vérification de la réponse
    if (!data || data.status !== 200) {
      throw new Error(`API Henrik Dev retourne: ${data?.status || 'Erreur inconnue'}`);
    }

    // Formatage des données pour correspondre à votre format
    const accountData = {
      puuid: data.data?.puuid,
      gameName: data.data?.name,
      tagLine: data.data?.tag,
      account_level: data.data?.account_level || 0,
      region: data.data?.region || 'eu'
    };

    console.log(`✅ Compte Valorant trouvé: ${accountData.gameName}#${accountData.tagLine}`);
    res.json({ uid, data: accountData, success: true });

  } catch (error) {
    console.error("❌ Valorant account error:", error.message);
    
    // Fallback vers l'API Riot officielle si Henrik Dev échoue
    if (RIOT_API_KEY) {
      try {
        console.log("🔄 Tentative avec l'API Riot officielle...");
        
        const { data: riotData } = await axios.get(
          `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
          {
            headers: { "X-Riot-Token": RIOT_API_KEY },
            timeout: 10000
          }
        );
        
        res.json({ uid, data: riotData, success: true });
        return;
      } catch (riotError) {
        console.error("❌ API Riot aussi échoue:", riotError.message);
      }
    }
    
    const errorInfo = handleApiError(error, 'Valorant Account');
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