import { EmbedBuilder, GuildMember, TextChannel } from "discord.js";

const boostChannelId = process.env.BOOST_CHANNEL_ID;

export default {
    name: "guildMemberUpdate",
    async execute(
        oldMember: GuildMember,
        newMember: GuildMember
    ): Promise<void> {
        try {
            if (!boostChannelId)
                throw new Error("Boost channel not found, speak with your dev");
            const boostChannel = newMember.guild.channels.cache.get(
                boostChannelId
            ) as TextChannel;
            if (!boostChannel)
                throw new Error("Boost channel not found, speak with your dev");

            const oldBoostStatus = oldMember.premiumSince;
            const newBoostStatus = newMember.premiumSince;

            if (!oldBoostStatus && newBoostStatus) {
                // Member just started boosting
                const boostEmbed = new EmbedBuilder()
                    .setColor(0xff73fa) // You can customize the embed color
                    .setTitle("✨ New Server Booster!")
                    .setDescription(
                        `Thanks for the boost **N Word**🐒\n\nMay you have endless supply of fried chicken and more watermelons to come!`
                    )
                    .setThumbnail(
                        newMember.user.displayAvatarURL({ size: 512 })
                    )
                    .setTimestamp();

                try {
                    // Send the embed message to the boost channel
                    await boostChannel.send({
                        content: `${newMember}`, // Ping the booster
                        embeds: [boostEmbed],
                        allowedMentions: { parse: ["users"] },
                    });
                } catch (error) {
                    console.error("Error sending boost notification:", error);
                }
            }
        } catch (error) {
            console.error("Error sending boost notification:", error);
        }
    },
};
