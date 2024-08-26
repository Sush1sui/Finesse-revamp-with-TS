import { EmbedBuilder, GuildMember, TextChannel } from "discord.js";

const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;

export default {
    name: "guildMemberAdd",
    async execute(member: GuildMember): Promise<void> {
        try {
            if (!welcomeChannelId)
                throw new Error(
                    "Welcome channel not found, speak with your dev"
                );

            const welcomeChannel = member.guild.channels.cache.get(
                welcomeChannelId
            ) as TextChannel;

            if (!welcomeChannel)
                throw new Error(
                    "Welcome channel not found, speak with your dev"
                );

            const welcomeEmbed = new EmbedBuilder()
                .setColor(0xffffff)
                .setTitle("-ˏˋ⋆ ᴡ ᴇ ʟ ᴄ ᴏ ᴍ ᴇ ⋆ˊˎ-")
                .setDescription(
                    `Hello ${member}! Welcome to **Finesse**.\n\n` +
                        `Please make sure you head to <#943839228356358144> before chatting.\n` +
                        `On top of that, please go to <#1271017215751098418> to set up your profile.\n\n` +
                        `└─── we hope you enjoy your stay in here!──➤`
                );
            // .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            // .setTimestamp();

            await welcomeChannel.send({
                embeds: [welcomeEmbed],
                allowedMentions: { parse: ["users"] },
            });
        } catch (error) {
            console.error("Error sending welcome message:", error);
        }
    },
};
