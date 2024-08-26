import { Client, Collection, GatewayIntentBits } from "discord.js";
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { CustomClient } from "./model/CustomClient";

// make new Client instance
// "cast" it to CustomClient
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
}) as CustomClient;

// BOOM just like in discord.js docs
client.commands = new Collection();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith(".ts"));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ("data" in command.default && "execute" in command.default) {
            client.commands.set(command.default.data.name, command.default);
        } else {
            console.log(
                `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
            );
        }
    }
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".ts"));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.default.once) {
        client.once(event.default.name, (...args) =>
            event.default.execute(...args)
        );
    } else {
        console.log(event.default);
        client.on(event.default.name, (...args) =>
            event.default.execute(...args)
        );
    }
}

client.login(process.env.bot_token);
