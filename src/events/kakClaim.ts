import { Message } from "discord.js";
import { getKakClaimTimer } from "../app";

const timeoutMap = new Map<string, NodeJS.Timeout>();
const intervalMap = new Map<string, NodeJS.Timeout>();

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

            // Clear existing timeout and interval if user types the command again
            if (timeoutMap.has(userId)) {
                clearTimeout(timeoutMap.get(userId) as NodeJS.Timeout);
                clearInterval(intervalMap.get(userId) as NodeJS.Timeout);
                timeoutMap.delete(userId);
                intervalMap.delete(userId);
            }

            const duration = getKakClaimTimer();
            let remainingTime = duration / 1000;

            // Send the initial message with the countdown
            const replyMessage = await message.reply(
                `**You can kak/trash claim now <@${userId}> in ${remainingTime} seconds!**`
            );
            // Update the message every second with the remaining time
            const intervalId = setInterval(async () => {
                remainingTime--;
                if (remainingTime >= 0) {
                    try {
                        await replyMessage.edit(
                            `**You can kak/trash claim now <@${userId}> in ${remainingTime} seconds!**`
                        );
                    } catch (error) {
                        console.error(
                            "Error updating countdown message:",
                            error
                        );
                    }
                }
            }, 1000);

            // Set a timeout to send the final message when the countdown ends
            const timeoutId = setTimeout(async () => {
                clearInterval(intervalId); // Clear the interval once the countdown is over
                try {
                    await replyMessage.delete();
                    await message.reply(
                        `**You can kak/trash claim now <@${userId}>!**`
                    );
                } catch (error) {
                    console.error("Error sending claim message:", error);
                } finally {
                    timeoutMap.delete(userId);
                    intervalMap.delete(userId);
                }
            }, duration);

            // Store the timeout and interval IDs for the user
            timeoutMap.set(userId, timeoutId);
            intervalMap.set(userId, intervalId);
        }
    },
};
