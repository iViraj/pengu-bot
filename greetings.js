import fs from "fs";

const PATH = "./greetings.json";

function load() {
  if (!fs.existsSync(PATH)) return {};
  return JSON.parse(fs.readFileSync(PATH, "utf-8"));
}

function save(data) {
  fs.writeFileSync(PATH, JSON.stringify(data, null, 2));
}

// ===== FORMAT MESSAGE =====
function formatMessage(template, member) {
  if (!template) return null;

  return template
    .replaceAll("{user}", `<@${member.id}>`)
    .replaceAll("{username}", member.user.username)
    .replaceAll("{server}", member.guild.name)
    .replaceAll("<br>", "\n");
}

// ===== JOIN EVENT =====
export function handleJoin(member) {
  const data = load();
  const guildId = member.guild.id;

  if (!data[guildId]?.greetingChannel) return;

  const channel = member.guild.channels.cache.get(
    data[guildId].greetingChannel
  );

  if (!channel) return;

  const msg = formatMessage(data[guildId].greetingMessage, member);

  if (msg) channel.send(msg);
}

// ===== LEAVE EVENT =====
export function handleLeave(member) {
  const data = load();
  const guildId = member.guild.id;

  if (!data[guildId]?.farewellChannel) return;

  const channel = member.guild.channels.cache.get(
    data[guildId].farewellChannel
  );

  if (!channel) return;

  const msg = formatMessage(data[guildId].farewellMessage, member);

  if (msg) channel.send(msg);
}

// ===== COMMAND HANDLER =====
export function handleGreetingCommands(interaction) {
  const data = load();
  const guildId = interaction.guild.id;

  if (!data[guildId]) data[guildId] = {};

  // ===== SET GREETING CHANNEL =====
  if (interaction.commandName === "setup_greeting") {
    const channel = interaction.options.getChannel("channel");

    data[guildId].greetingChannel = channel.id;
    save(data);

    return interaction.reply(`greeting channel set to ${channel} 😊`);
  }

  // ===== SET GREETING MESSAGE =====
  if (interaction.commandName === "set_greeting_message") {
    const msg = interaction.options.getString("message");

    data[guildId].greetingMessage = msg;
    save(data);

    return interaction.reply("greeting message updated ✨");
  }

  // ===== TEST GREETING =====
  if (interaction.commandName === "test_greeting") {
    const fakeMember = interaction.member;

    const msg = formatMessage(data[guildId].greetingMessage, fakeMember);

    return interaction.reply(msg || "no greeting message set 💀");
  }

  // ===== SET FAREWELL CHANNEL =====
  if (interaction.commandName === "setup_farewell") {
    const channel = interaction.options.getChannel("channel");

    data[guildId].farewellChannel = channel.id;
    save(data);

    return interaction.reply(`farewell channel set to ${channel} 👋`);
  }

  // ===== SET FAREWELL MESSAGE =====
  if (interaction.commandName === "set_farewell_message") {
    const msg = interaction.options.getString("message");

    data[guildId].farewellMessage = msg;
    save(data);

    return interaction.reply("farewell message updated 🥲");
  }

  // ===== TEST FAREWELL =====
  if (interaction.commandName === "test_farewell") {
    const fakeMember = interaction.member;

    const msg = formatMessage(data[guildId].farewellMessage, fakeMember);

    return interaction.reply(msg || "no farewell message set 💀");
  }
}
