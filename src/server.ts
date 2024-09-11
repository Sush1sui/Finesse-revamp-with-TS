import express from "express";
import "dotenv/config";
import fetch from "node-fetch";
import AbortController from "abort-controller";

const app = express();
const PORT = process.env.PORT || 6969;
let intervalId: NodeJS.Timeout; // Typing intervalId properly for Node.js

export function startServer() {
    app.get("/", (_req, res) => res.send("Bot is running"));

    intervalId = setInterval(() => {
        const controller = new AbortController();
        const timeout = setTimeout(() => {
            controller.abort();
        }, 5000); // 5-second timeout

        if (process.env.BOT) {
            fetch(process.env.BOT, { signal: controller.signal })
                .then((res) => res.text())
                .then((text) => {
                    console.log("Ping successful:", text);
                    clearTimeout(timeout); // Clear timeout on success
                })
                .catch((err) => {
                    if (err.name === "AbortError") {
                        console.error("Ping failed: Timeout");
                    } else {
                        console.error("Ping failed:", err);
                    }
                });
        }
    }, 600000); // Ping every 10 minutes

    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

    // Graceful shutdown
    process.on("SIGINT", () => {
        clearInterval(intervalId); // Stop the interval when the server is shutting down
        console.log("Server shutting down gracefully");
        process.exit(0);
    });
}
