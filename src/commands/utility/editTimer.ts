import {
    ChatInputCommandInteraction,
    GuildEmojiRoleManager,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from "discord.js";
import { changeKakClaimTimer } from "../../app";

const AUTHORIZED_ROLE_IDs = process.env.AUTHORIZED_ROLE_IDs;

if (!AUTHORIZED_ROLE_IDs) throw new Error("No role IDs");
AUTHORIZED_ROLE_IDs.split(",");

export default {
    data: new SlashCommandBuilder()
        .setName("edit_kc")
        .setDescription("Edits kakera claim or trash claim")
        .addIntegerOption((option) =>
            option
                .setName("duration")
                .setDescription("sets timer duration before ping (in seconds)")
                .setRequired(true)
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

        const durationString = interaction.options.getInteger("duration");
        if (isNaN(Number(durationString))) throw new Error("Not an integer");

        try {
            changeKakClaimTimer(Number(durationString));
            await interaction.editReply({
                content: `**Edited kak/trash claim timer to ${durationString}**`,
            });
        } catch (error) {
            // Type assertion to Error
            const errorMessage = (error as Error).message;
            await interaction.editReply({
                content: `There was an error editing timer: ${errorMessage}`,
            });
        }
    },
};
