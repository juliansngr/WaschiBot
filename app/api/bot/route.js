// Installiere zuerst: npm install ws

const WebSocket = require("ws");

// Deine Zugangsdaten – ersetze die Platzhalter durch deine Werte
const OAUTH_TOKEN = "oauth:dein_oauth_token"; // inkl. "oauth:"-Präfix
const BOT_USERNAME = "dein_bot_username";
const CHANNEL = "#dein_channel_name"; // z.B. '#meinkanal'

// Twitch IRC WebSocket-URL
const WS_URL = "wss://irc-ws.chat.twitch.tv:443";

const ws = new WebSocket(WS_URL);

ws.on("open", () => {
  console.log("▶️ Verbunden mit Twitch IRC");

  // 1) Authentifizieren
  ws.send(`PASS ${OAUTH_TOKEN}`);
  ws.send(`NICK ${BOT_USERNAME}`);

  // 2) Channel beitreten
  ws.send(`JOIN ${CHANNEL}`);
});

ws.on("message", (rawData) => {
  const message = rawData.toString();
  console.log("⬅️", message.trim());

  // PING/PONG für Keep‑Alive
  if (message.startsWith("PING")) {
    ws.send("PONG :tmi.twitch.tv");
    return;
  }

  // Beispiel: auf Chat‑Nachrichten reagieren
  // IRC‑Format: :user!user@user.tmi.twitch.tv PRIVMSG #channel :Nachrichtentext
  const match = message.match(/^:([^!]+)!.* PRIVMSG #[^ ]+ :(.+)$/);
  if (match) {
    const user = match[1];
    const text = match[2];
    console.log(`💬 ${user}: ${text}`);

    // Beispiel-Antwort: wenn jemand "!ping" schreibt
    if (text === "!ping") {
      const reply = `PRIVMSG ${CHANNEL} :@${user}, Pong! 🏓`;
      ws.send(reply);
      console.log("➡️", reply);
    }
  }
});

ws.on("error", (err) => {
  console.error("❌ WebSocket-Error:", err);
});

ws.on("close", (code, reason) => {
  console.log(`🔴 Verbindung geschlossen: [${code}] ${reason}`);
});
