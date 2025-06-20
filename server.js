const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

const BRAWL_API_KEY = process.env.BRAWL_API_KEY;
const CLASH_API_KEY = process.env.CLASH_API_KEY;
const COC_API_KEY = process.env.COC_API_KEY;

app.use(cors());

// Route Brawl Stars
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

// Route Clash Royale
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

// ✅ Route Clash of Clans
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

// Test IP
app.get("/my-ip", async (req, res) => {
  try {
    const ip = await axios.get("https://api64.ipify.org?format=json");
    res.json({ ip: ip.data.ip });
  } catch (err) {
    res.status(500).json({ error: "Impossible de récupérer l'IP." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
