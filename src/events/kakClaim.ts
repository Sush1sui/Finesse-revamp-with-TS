import { Message } from "discord.js";
import { getKakClaimTimer } from "../app";

const timeoutMap = new Map<string, NodeJS.Timeout>();

export default {
    name: "messageCreate",
    async execute(message: Message): Promise<void> {
        if (
            message.content.toLowerCase() === "$kak claim" ||
            message.content.toLowerCase() === "$kc"
        ) {
            const channel = message.channel;
            if (channel.id !== "1271716966125539369") return;
            const userId = message.author.id;

            // Clear existing timeout if user types the command again
            if (timeoutMap.has(userId)) {
                clearTimeout(timeoutMap.get(userId) as NodeJS.Timeout);
                timeoutMap.delete(userId);
            }

            const duration = getKakClaimTimer();

            // Set a new timeout to send the message after 40 seconds
            const timeoutId = setTimeout(async () => {
                try {
                    await message.reply(
                        `**You can kak/trash claim now <@${userId}>!**`
                    );
                } catch (error) {
                    console.error("Error sending claim message:", error);
                } finally {
                    timeoutMap.delete(userId);
                }
            }, duration);

            // Store the timeout ID for the user
            timeoutMap.set(userId, timeoutId);
        }
    },
};
