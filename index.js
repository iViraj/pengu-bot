import { Client, GatewayIntentBits } from "discord.js";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// Load persona
const persona = JSON.parse(fs.readFileSync("./persona.json", "utf-8"));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// 🔥 MAIN CHAT LOGIC
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  const shouldReply =
    message.mentions.has(client.user) ||
    content.includes("pengu") ||
    Math.random() < 0.2; // 20% chance

  if (!shouldReply) return;

  try {
    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "openai/gpt-oss-120b",
        messages: [
          {
            role: "system",
            content: persona.system_prompt
          },
          {
            role: "user",
            content: message.content
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    let reply = res.data.choices[0].message.content;

    // trim long replies
    if (reply.length > 200) {
      reply = reply.slice(0, 200);
    }

    message.reply(reply);
  } catch (err) {
    console.log("❌ AI ERROR:", err.response?.data || err.message);
  }
});

// 🎲 RANDOM TOPIC STARTER (FOMO engine)
setInterval(() => {
  const channel = client.channels.cache.get(process.env.CHANNEL_ID);
  if (!channel) return;

  const topics = [
    "bro why is everyone dead today 💀",
    "minecraft or roblox rn? choose 🐧",
    "who here actually sleeps early 🤨",
    "cold weather >>> summer ngl ❄️",
    "what game y'all grinding rn",
    "anyone wanna vc or just ghosting 👀"
  ];

  const msg = topics[Math.floor(Math.random() * topics.length)];

  channel.send(msg);
}, 1000 * 60 * 60); // every 8 min

client.login(process.env.DISCORD_TOKEN);
