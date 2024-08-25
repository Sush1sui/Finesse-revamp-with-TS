import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    GuildEmojiRoleManager,
    NewsChannel,
    PermissionFlagsBits,
    SlashCommandBuilder,
    TextChannel,
} from "discord.js";
import extractMentions from "../../utils/extractMentions";

const AUTHORIZED_ROLE_IDs = process.env.AUTHORIZED_ROLE_IDs;

if (!AUTHORIZED_ROLE_IDs) throw new Error("No role IDs");
AUTHORIZED_ROLE_IDs.split(",");

export default {
    data: new SlashCommandBuilder()
        .setName("announce")
        .setDescription("(TEST) Make an announcement with an embedded message")
        .addChannelOption((option) =>
            option
                .setName("channel")
                .setDescription(
                    "The channel where the announcement will be sent"
                )
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("title")
                .setDescription("The announcement title")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("message")
                .setDescription("The announcement message")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("roles")
                .setDescription("Comma-separated list of role names to mention")
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName("users")
                .setDescription("Comma-separated list of user names to mention")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const member = interaction.member;
        if (!member || !interaction.guild) {
            await interaction.reply({
                content: "This command can only be used in a guild.",
                ephemeral: true,
            });
            return;
        }

        // i have no idea, i just clicked "fix" on vscode
        const guildMember = member.roles as unknown as GuildEmojiRoleManager;

        const hasRole = guildMember.cache.some((role) =>
            AUTHORIZED_ROLE_IDs.includes(role.id)
        );

        if (!hasRole) {
            await interaction.reply({
                content:
                    "You do not have the required permissions to use this command.",
                ephemeral: true,
            });
            return;
        }

        await interaction.deferReply({ ephemeral: true });

        const channel = interaction.options.getChannel("channel");
        const title = interaction.options.getString("title");
        const message = interaction.options.getString("message");
        const roleNames = interaction.options.getString("roles");
        const userNames = interaction.options.getString("users");

        const embed = new EmbedBuilder()
            .setColor(0xffd700)
            .setTitle(title)
            .setDescription(message);

        const rolePings = extractMentions(roleNames || "");
        const userPings = extractMentions(userNames || "");

        try {
            await (channel as TextChannel | NewsChannel).send({
                content: `${rolePings} ${userPings}`,
                embeds: [embed],
                allowedMentions: { parse: ["roles", "users"] },
            });
            await interaction.editReply({
                content: `Announcement sent to ${channel}!`,
            });
        } catch (error) {
            // Type assertion to Error
            const errorMessage = (error as Error).message;
            await interaction.editReply({
                content: `There was an error sending the announcement: ${errorMessage}`,
            });
        }
    },
};
