import {
    Client,
    Collection,
    CommandInteraction,
    Events,
    GatewayIntentBits,
    Interaction,
} from "discord.js";
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import deployCommands from "./deploy-commands";

// define custom type extending Client class
interface CustomClient extends Client {
    commands: Collection<string, any>;
}

// make new Client instance
// "cast" it to CustomClient
const client = new Client({
    intents: [GatewayIntentBits.Guilds],
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

client.once(Events.ClientReady, (readyClient) => {
    deployCommands();
    console.log(`Logged in as ${readyClient.user.tag}`);
});

client.on(
    Events.InteractionCreate,
    async (interaction: Interaction): Promise<void> => {
        if (!interaction.isChatInputCommand()) return;

        // NOTE: Client instance is always available at "interaction.client"
        const command = client.commands.get(interaction.commandName);

        if (!command) {
            console.error(
                `No command matching ${interaction.command} was found.`
            );
            return;
        }

        try {
            await command.execute(interaction as CommandInteraction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: "There was an error while executing this command!",
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    content: "There was an error while executing this command!",
                    ephemeral: true,
                });
            }
        }
    }
);

client.login(process.env.bot_token);
