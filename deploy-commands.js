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

new SlashCommandBuilder()
  .setName("setup_greeting")
  .setDescription("Set greeting channel")
  .addChannelOption(opt =>
    opt.setName("channel").setDescription("Channel").setRequired(true)
  ),

new SlashCommandBuilder()
  .setName("set_greeting_message")
  .setDescription("Set greeting message")
  .addStringOption(opt =>
    opt.setName("message").setDescription("Message").setRequired(true)
  ),

new SlashCommandBuilder()
  .setName("test_greeting")
  .setDescription("Test greeting"),

new SlashCommandBuilder()
  .setName("setup_farewell")
  .setDescription("Set farewell channel")
  .addChannelOption(opt =>
    opt.setName("channel").setDescription("Channel").setRequired(true)
  ),

new SlashCommandBuilder()
  .setName("set_farewell_message")
  .setDescription("Set farewell message")
  .addStringOption(opt =>
    opt.setName("message").setDescription("Message").setRequired(true)
  ),

new SlashCommandBuilder()
  .setName("test_farewell")
  .setDescription("Test farewell"),

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

