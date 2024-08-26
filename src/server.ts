import express from "express";
import "dotenv/config";
const app = express();
const PORT = process.env.PORT || 6969;

export function startServer() {
    app.get("/", (_req, res) => res.send("Bot is running"));

    setInterval(() => {
        if (!process.env.BOT) throw new Error("Server not found");
        fetch(process.env.BOT)
            .then((res) => res.text())
            .then((text) => console.log("Ping successful:", text))
            .catch((err) => console.error("Ping failed:", err));
    }, 600000); // 600000 ms = 10 minutes

    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
}
