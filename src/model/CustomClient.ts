import { Client, Collection } from "discord.js";

// define custom type extending Client class
export interface CustomClient extends Client {
    commands: Collection<string, any>;
}
