import WebSocket from "ws";

let twitchSocket;

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!twitchSocket) {
    const { TWITCH_OAUTH_TOKEN, TWITCH_BOT_USERNAME, TWITCH_CHANNEL } =
      process.env;

    twitchSocket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

    twitchSocket.on("open", () => {
      console.log("▶️ Verbunden mit Twitch IRC");
      twitchSocket.send(`PASS ${TWITCH_OAUTH_TOKEN}`);
      twitchSocket.send(`NICK ${TWITCH_BOT_USERNAME}`);
      twitchSocket.send(`JOIN ${TWITCH_CHANNEL}`);
    });

    twitchSocket.on("message", (data) => {
      const message = data.toString();
      console.log("⬅️", message.trim());

      if (message.startsWith("PING")) {
        twitchSocket.send("PONG :tmi.twitch.tv");
        return;
      }

      const match = message.match(/^:([^!]+)!.* PRIVMSG #[^ ]+ :(.+)$/);
      if (match) {
        const user = match[1];
        const text = match[2];
        console.log(`💬 ${user}: ${text}`);

        if (text === "!ping") {
          const reply = `PRIVMSG ${TWITCH_CHANNEL} :@${user}, Pong! 🏓`;
          twitchSocket.send(reply);
          console.log("➡️", reply);
        }
      }
    });

    twitchSocket.on("error", (err) => {
      console.error("❌ WebSocket-Error:", err);
    });

    twitchSocket.on("close", (code, reason) => {
      console.log(`🔴 Verbindung geschlossen: [${code}] ${reason}`);
      twitchSocket = null;
    });
  }

  res
    .status(200)
    .json({ success: true, message: "Twitch-Bot läuft im Hintergrund." });
}
