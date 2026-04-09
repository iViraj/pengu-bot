import fs from "fs";

const COUNT_PATH = "./counting.json";

function loadCount() {
  if (!fs.existsSync(COUNT_PATH)) return {};
  return JSON.parse(fs.readFileSync(COUNT_PATH, "utf-8"));
}

function saveCount(data) {
  fs.writeFileSync(COUNT_PATH, JSON.stringify(data, null, 2));
}

// ===== MAIN HANDLER =====
export function handleCounting(message) {
  if (message.author.bot) return;

  const data = loadCount();
  const guildId = message.guild.id;

  if (!data[guildId] || !data[guildId].channel) return;

  // ignore other channels
  if (message.channel.id !== data[guildId].channel) return;

  const content = message.content.trim();

  // ignore non-number messages
  if (!/^\d+$/.test(content)) return;

  const number = parseInt(content);

  const current = data[guildId].count || 0;
  const lastUser = data[guildId].lastUser || null;

  // ❌ Prevent same user twice
  if (lastUser === message.author.id) {
    message.react("❌");

    message.reply(`${message.author} bro you can't count twice 💀 wait for someone else`);

    data[guildId].count = 0;
    data[guildId].lastUser = null;

    saveCount(data);
    return;
  }

  // ✅ Correct number
  if (number === current + 1) {
    data[guildId].count = number;
    data[guildId].lastUser = message.author.id;

    saveCount(data);

    if (number % 2 === 0) {
      message.react("✅");
    } else {
      message.react("☑️");
    }

  } else {
    // ❌ Wrong number
    message.react("❌");

    message.reply(`${message.author} ruined the counting at **${number}** 💀 start again from 1`);

    data[guildId].count = 0;
    data[guildId].lastUser = null;

    saveCount(data);
  }
}

// ===== SLASH COMMANDS =====
export function handleCountingCommands(interaction) {
  const data = loadCount();
  const guildId = interaction.guild.id;

  // SETUP
  if (interaction.commandName === "setup_counting") {
    data[guildId] = {
      channel: interaction.channel.id,
      count: 0,
      lastUser: null
    };

    saveCount(data);

    return interaction.reply(`counting enabled in ${interaction.channel} 🔢`);
  }

  // RESET
  if (interaction.commandName === "reset_counting") {
    if (!data[guildId]) {
      return interaction.reply({
        content: "counting not setup yet 💀",
        ephemeral: true
      });
    }

    data[guildId].count = 0;
    data[guildId].lastUser = null;

    saveCount(data);

    return interaction.reply("count reset to 0 🔄");
  }
}
