const express = require('express');
const cors = require('cors');
const axios = require('axios');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // 🔥 Active CORS pour toutes les routes
app.use(express.json());

const BRAWL_API_KEY = process.env.BRAWL_API_KEY;
const CLASH_API_KEY = process.env.CLASH_API_KEY;
const COC_API_KEY = process.env.COC_API_KEY;
const RIOT_API_KEY = process.env.RIOT_API_KEY;

// === Brawl Stars
app.get("/api/player/:uid/:tag", async (req, res) => {
  const tag = req.params.tag.replace("#", "").toUpperCase();
  const uid = req.params.uid;

  try {
    const { data } = await axios.get(`https://api.brawlstars.com/v1/players/%23${tag}`, {
      headers: { Authorization: `Bearer ${BRAWL_API_KEY}` },
    });
    res.json({ uid, data });
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// === Clash Royale
app.get("/api/clash/:uid/:tag", async (req, res) => {
  const tag = req.params.tag.replace("#", "").toUpperCase();
  const uid = req.params.uid;

  try {
    const { data } = await axios.get(`https://api.clashroyale.com/v1/players/%23${tag}`, {
      headers: { Authorization: `Bearer ${CLASH_API_KEY}` },
    });
    res.json({ uid, data });
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// === Clash of Clans
app.get("/api/clashofclans/:uid/:tag", async (req, res) => {
  const tag = req.params.tag.replace("#", "").toUpperCase();
  const uid = req.params.uid;

  try {
    const { data } = await axios.get(`https://api.clashofclans.com/v1/players/%23${tag}`, {
      headers: { Authorization: `Bearer ${COC_API_KEY}` },
    });
    res.json({ uid, data });
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// === League of Legends
app.get("/api/lol/:uid/:summonerName", async (req, res) => {
  const { uid, summonerName } = req.params;
  try {
    const { data } = await axios.get(
      `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`,
      {
        headers: { "X-Riot-Token": RIOT_API_KEY }
      }
    );
    res.json({ uid, data });
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// === Valorant (via Riot ID)
app.get("/api/valorant/:uid/:riotId", async (req, res) => {
  const { uid, riotId } = req.params;
  const [gameName, tagLine] = riotId.split("#");

  if (!gameName || !tagLine) {
    return res.status(400).json({ error: "Invalid Riot ID format" });
  }

  try {
    const { data } = await axios.get(
      `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
      {
        headers: { "X-Riot-Token": RIOT_API_KEY }
      }
    );
    res.json({ uid, data });
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
});

// === Test IP
app.get("/my-ip", async (req, res) => {
  try {
    const ip = await axios.get("https://api64.ipify.org?format=json");
    res.json({ ip: ip.data.ip });
  } catch (err) {
    res.status(500).json({ error: "Impossible de récupérer l'IP." });
  }
});

// === Start
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
