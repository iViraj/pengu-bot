import { REST, Routes, SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const commands = [
  new SlashCommandBuilder()
    .setName("setchannel")
    .setDescription("Set channel for Pengu")
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("Select a channel")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("removechannel")
    .setDescription("Remove a channel")
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("Select a channel")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("listchannels")
    .setDescription("List active channels"),

  new SlashCommandBuilder()
    .setName("resetchannels")
    .setDescription("Reset all channels"),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show commands"),

new SlashCommandBuilder()
  .setName("setup_counting")
  .setDescription("Setup counting in this channel"),

new SlashCommandBuilder()
  .setName("reset_counting")
  .setDescription("Reset counting sequence"),
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("🔄 Registering slash commands...");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("✅ Slash commands registered");
  } catch (error) {
    console.error(error);
  }
})();

