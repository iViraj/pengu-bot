import { Client, GatewayIntentBits, PermissionsBitField } from "discord.js";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// ===== CONFIG SYSTEM =====
const CONFIG_PATH = "./config.json";

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return {};
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
}

function saveConfig(data) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2));
}

// ===== CLIENT =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ===== PERSONA =====
const SYSTEM_PROMPT = `
You are Pengu 🐧, a chill penguin from Antarctica.

Personality:
- Gen Z vibe, casual, slightly sarcastic, playful
- Friendly but not overly nice
- Light roasting allowed (never toxic)

Style:
- Keep replies short (1–2 lines max)
- Use emojis sometimes (🐧💀😭🔥🤨)
- NEVER sound like an AI assistant
- NEVER be formal

Behavior:
- Talk like a real Discord user
- React naturally
- Sometimes ask questions
- Keep convos alive but don’t dominate
`;

client.once("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ===== MESSAGE HANDLER =====
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();
  const config = loadConfig();
  const guildId = message.guild?.id;

  // ===== COMMANDS =====

  // HELP
  if (content === "!help") {
    return message.reply(`
🐧 **Pengu Commands**

!setchannel → set channels where Pengu can chat  
!help → show this  

mention me or say "pengu" to talk 👀
`);
  }

  // SET CHANNEL
  if (content.startsWith("!setchannel")) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("admin only 😭");
    }

    const channels = message.mentions.channels;

    if (!channels.size) {
      return message.reply("mention at least one channel 💀");
    }

    config[guildId] = {
      channels: [...channels.map(c => c.id)]
    };

    saveConfig(config);

    return message.reply("done. pengu will chill there now 🐧");
  }

  // ===== RESTRICT TO CONFIG CHANNELS =====
  if (!config[guildId] || !config[guildId].channels.includes(message.channel.id)) {
    return;
  }

  // ===== SMART REPLY LOGIC =====
  const shouldReply =
    message.mentions.has(client.user) ||
    content.includes("pengu") ||
    Math.random() < 0.2;

  if (!shouldReply) return;

  try {
    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message.content }
        ],
        temperature: 0.8,
        max_tokens: 100
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    let reply = res.data.choices?.[0]?.message?.content;

    if (!reply) return;

    // Trim long replies
    if (reply.length > 200) {
      reply = reply.slice(0, 200);
    }

    await message.reply(reply);

  } catch (err) {
    console.log("❌ AI ERROR:", err.response?.data || err.message);
  }
});

// ===== RANDOM TOPIC SYSTEM =====
setInterval(() => {
  const config = loadConfig();

  Object.keys(config).forEach(guildId => {
    const guildData = config[guildId];

    guildData.channels.forEach(channelId => {
      const channel = client.channels.cache.get(channelId);
      if (!channel) return;

      const topics = [
        "bro why is everyone dead today 💀",
        "minecraft or roblox rn? 🐧",
        "who’s actually active here 👀",
        "ngl cold weather >>> everything ❄️",
        "anyone up for vc?",
        "what game y’all grinding rn"
      ];

      const msg = topics[Math.floor(Math.random() * topics.length)];

      channel.send(msg);
    });
  });
}, 1000 * 60 * 10); // every 10 mins

// ===== ERROR HANDLING =====
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

// ===== LOGIN =====
client.login(process.env.DISCORD_TOKEN);
