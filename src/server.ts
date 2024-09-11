import express from "express";
import "dotenv/config";
import fetch from "node-fetch"; // Ensure this is installed and imported

const app = express();
const PORT = process.env.PORT || 6969;

function pingBot() {
    if (process.env.BOT) {
        fetch(process.env.BOT, { timeout: 5000 }) // Set a timeout of 5 seconds
            .then((res) => res.text())
            .then((text) => console.log("Ping successful:", text))
            .catch((err) => {
                if (err.name === "AbortError") {
                    console.error("Ping failed: Timeout");
                } else {
                    console.error("Ping failed:", err);
                }
            });
    }
}

export function startServer() {
    app.get("/", (_req, res) => res.send("Bot is running"));

    setInterval(pingBot, 600000); // Ping every 10 minutes

    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

    // Graceful shutdown
    process.on("SIGINT", () => {
        console.log("Server shutting down gracefully");
        process.exit(0);
    });
}
