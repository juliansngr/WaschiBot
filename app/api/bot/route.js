import { NextResponse } from "next/server";
import WebSocket from "ws";

let twitchSocket;

export async function GET(request) {
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

      if (message.includes("Hallo Welt")) {
        twitchSocket.send(`PRIVMSG ${TWITCH_CHANNEL} :Lösch dich`);
      }

      //   const match = message.match(/^:([^!]+)!.* PRIVMSG #[^ ]+ :(.+)$/);
      //   console.log("match", match);
      //   if (match) {
      //     const user = match[1];
      //     const text = match[2];
      //     console.log(`💬 ${user}: ${text}`);

      //     if (text === "Hello World") {
      //       const reply = `PRIVMSG ${TWITCH_CHANNEL} :@${user}, Pong! 🏓`;
      //       twitchSocket.send(reply);
      //       console.log("➡️", reply);
      //     }
      //   }
    });

    twitchSocket.on("error", (err) => {
      console.error("❌ WebSocket-Error:", err);
    });

    twitchSocket.on("close", (code, reason) => {
      console.log(`🔴 Verbindung geschlossen: [${code}] ${reason}`);
      twitchSocket = null;
    });
  }

  return NextResponse.json({
    success: true,
    message: "Twitch-Bot läuft im Hintergrund.",
  });
}
