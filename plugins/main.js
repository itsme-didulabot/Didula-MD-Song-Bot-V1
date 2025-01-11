
const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');
const yts = require("yt-search");
const axios = require('axios');
const mimeTypes = require('mime-types');
const db = require('../database');

// Configuration
const config = {
    aliveGif: 'https://i.giphy.com/6FjaNxfq8vHSQI0aVm.webp',
    ownerNumber: '94771820962',
    botName: 'DIDULA MD SONG BOT',
    searchQueries: [
        "Sinhala songs",
        "Slowed Reverb Sinhala",
        "New Sinhala Song",
        "මනෝපාරකට",
        "Sinhala songs 2025",
        "New Slowed Reverb Sinhala",
        "dj Sinhala Song",
        "new මනෝපාරකට",
        "centigradez",
        "Sinhala Rap",
        "Sinhala Bass Boosted songs",
        "Sinhala mind relaxing song",
        "2025 new sinhala song",
        "2025 Slowed Reverb Sinhala",
        "dj Sinhala nonstop",
        "2025 මනෝපාරකට",
        "manoparakata 2025"
    ],
    checkInterval: 60000,
    requestTimeout: 15000,
    maxRetries: 3,
    retryDelay: 1000
};

// State management
let activeGroups = {};
let lastSongTitles = {};
let searchIndex = 0; // Start with the first search query

// Utility Functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const errorHandler = async (error, conn, from, customMessage) => {
    console.error(`Error: ${error.message}`);
    if (conn && from) {
        await conn.sendMessage(from, { text: customMessage || `Error: ${error.message}` })
            .catch(console.error);
    }
};

// Core Functions
async function getLatestSong(retryCount = config.maxRetries) {
    for (let i = 0; i < retryCount; i++) {
        try {
            const searchQuery = config.searchQueries[searchIndex];
            const searchResult = await yts(searchQuery);

            if (!searchResult?.all?.length) continue;

            // Loop through the search results to find a non-duplicate song
            for (const song of searchResult.all) {
                if (lastSongTitles[searchIndex] !== song.title) {
                    const downloadInfo = await fetchJson(
                        `https://apitest1-f7dcf17bd59b.herokuapp.com/download/ytmp3?url=${encodeURIComponent(song.url)}`
                    );

                    if (downloadInfo?.result?.dl_link) {
                        return {
                            title: downloadInfo.result.title || song.title,
                            artist: song.author?.name || 'Unknown Artist',
                            downloadUrl: downloadInfo.result.dl_link,
                            thumbnail: song.thumbnail,
                            audioUrl: downloadInfo.result.dl_link
                        };
                    }
                }
            }

            // If no valid song found, continue to the next search query
            searchIndex = (searchIndex + 1) % config.searchQueries.length;

        } catch (error) {
            if (i === retryCount - 1) throw error;
            await sleep(config.retryDelay);
        }
    }
    return null;
}

async function sendSong(conn, groupId, song) {
    if (!song?.title || lastSongTitles[groupId] === song.title) return;

    lastSongTitles[groupId] = song.title; // Store the last sent song title
    const message = `*🎧${config.botName}🎧*\n\n${song.title}\n\n> *ᴛʜɪꜱ ɪꜱ ᴀᴜᴛᴏᴍᴀᴛɪᴄᴀʟʟʏ ꜱᴏɴɢ ꜱᴇɴᴅɪɴɢ ʙᴏᴛ*\n\n> *ᴄᴏɴᴛᴀᴄᴛ ᴏᴡɴᴇʀ*\n\nhttps://wa.me/message/DIDULLTK7ZOGH1\n\n> *ꜰᴏʟʟᴏᴡ ᴍʏ ᴄʜᴀɴᴇʟ*\n\nhttps://whatsapp.com/channel/0029VaqqF4GDTkJwKruLSK2f\n\n*© Projects of Didula Rashmika*`;

    try {
        const res = await axios.get(song.audioUrl, {
            responseType: 'arraybuffer',
            timeout: config.requestTimeout
        });

        const mime = res.headers['content-type'] || 'audio/mpeg';
        const extension = mimeTypes.extension(mime) || 'mp3';
        const fileName = `${song.title}.${extension}`.replace(/[<>:"/\\|?*]/g, '_');

        await conn.sendMessage(groupId, {
            document: Buffer.from(res.data),
            caption: message,
            mimetype: mime,
            fileName: fileName
        });

        await db.addSentSong(groupId, song.title);
    } catch (error) {
        throw new Error(`Failed to send song: ${error.message}`);
    }
}

// Initialize search index updater
(async function updateSearchIndex() {
    while (true) {
        await sleep(600000); // 10 minutes
        searchIndex = (searchIndex + 1) % config.searchQueries.length;
    }
})();

// Command Handlers
cmd({
    pattern: "startsong",
    desc: "Enable automatic song updates",
    isGroup: true,
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, participants }) => {
    try {
        const isAdmin = participants.some(p => p.id === mek.sender && p.admin);
        const isBotOwner = mek.sender === config.ownerNumber + '@s.whatsapp.net';

        if (!isAdmin && !isBotOwner) {
            return await conn.sendMessage(from, { text: "🚫 Admin or owner permission required" });
        }

        if (activeGroups[from]) {
            return await conn.sendMessage(from, { text: "🎵 Song updates already active" });
        }

        activeGroups[from] = true;
        await db.addStartedGroup(from);

        if (!activeGroups['interval']) {
            activeGroups['interval'] = setInterval(async () => {
                for (const groupId in activeGroups) {
                    if (activeGroups[groupId] && groupId !== 'interval') {
                        try {
                            const latestSong = await getLatestSong();
                            if (latestSong) await sendSong(conn, groupId, latestSong);
                        } catch (error) {
                            console.error(`Error in interval: ${error.message}`);
                        }
                    }
                }
            }, config.checkInterval);
        }

        await conn.sendMessage(from, { text: "🎵 Song updates activated" });
    } catch (error) {
        await errorHandler(error, conn, from, "Failed to activate song service");
    }
});

cmd({
    pattern: "stopsong",
    desc: "Disable automatic song updates",
    isGroup: true,
    react: "🛑",
    filename: __filename
}, async (conn, mek, m, { from, participants }) => {
    try {
        const isAdmin = participants.some(p => p.id === mek.sender && p.admin);
        const isBotOwner = mek.sender === conn.user.jid;

        if (!isAdmin && !isBotOwner) {
            return await conn.sendMessage(from, { text: "🚫 Admin or owner permission required" });
        }

        if (!activeGroups[from]) {
            return await conn.sendMessage(from, { text: "🛑 Song updates not active" });
        }

        delete activeGroups[from];
        await db.removeStoppedGroup(from);

        if (Object.keys(activeGroups).length === 1 && activeGroups['interval']) {
            clearInterval(activeGroups['interval']);
            delete activeGroups['interval'];
        }

        await conn.sendMessage(from, { text: "🛑 Song updates deactivated" });
    } catch (error) {
        await errorHandler(error, conn, from, "Failed to deactivate song service");
    }
});

cmd({
    pattern: "checksong",
    desc: "Check song service status",
    isGroup: true,
    react: "🔍",
    filename: __filename
}, async (conn, mek, m, { from }) => {
    try {
        const status = activeGroups[from] 
            ? "🎵 Song service is active" 
            : "🛑 Song service is not active";
        await conn.sendMessage(from, { text: status });
    } catch (error) {
        await errorHandler(error, conn, from, "Failed to check song service status");
    }
});

cmd({
    pattern: "alive",
    desc: "Check bot status",
    category: "main",
    filename: __filename
}, async(conn, mek, m, { from }) => {
    try {
        await conn.sendMessage(from, {
            image: { url: config.aliveGif },
            caption: ' 🎧DIDULA MD SONG BOT is Online and Ready!'
        }, { quoted: mek });
    } catch (error) {
        await errorHandler(error, conn, from, "Failed to check bot status");
    }
});

cmd({
    pattern: "menu",
    desc: "Display commands menu",
    category: "main",
    filename: __filename
}, async(conn, mek, m, { from, pushname, senderNumber }) => {
    try {
        const menuText = `*🎧DIDULA MD SONG BOT COMMANDS MENU*
        
╭─⦿ *Main Commands*
│ ⌲ .alive - Check bot status
│ ⌲ .menu - Show this menu
│ ⌲ .ping - Check bot speed
│ ⌲ .owner - Get owner info
╰────────────⦿

╭─⦿ *Song Commands*
│ ⌲ .startsong - Start auto songs
│ ⌲ .stopsong - Stop auto songs
│ ⌲ .checksong - Check service status
╰────────────⦿

╭─⦿ *User Info*
│ ⌲ Name: ${pushname}
│ ⌲ Number: ${senderNumber}
╰────────────⦿`;

        await conn.sendMessage(from, {
            image: { url: config.aliveGif },
            caption: menuText
        }, { quoted: mek });
    } catch (error) {
        await errorHandler(error, conn, from, "Failed to display menu");
    }
});

cmd({
    pattern: "ping",
    desc: "Check response time",
    category: "main",
    filename: __filename
}, async(conn, mek, m, { from }) => {
    try {
        const start = Date.now();
        await conn.sendMessage(from, { text: 'DIDULA MD SONG BOT Testing ping...' });
        const end = Date.now();
        const responseTime = end - start;

        await conn.sendMessage(from, {
            image: { url: config.aliveGif },
            caption: `🏓 Pong!\nResponse Time: ${responseTime}ms`
        }, { quoted: mek });
    } catch (error) {
        await errorHandler(error, conn, from, "Failed to check ping");
    }
});

cmd({
    pattern: "owner",
    desc: "Get owner contact",
    category: "main",
    filename: __filename
}, async(conn, mek, m, { from }) => {
    try {
        const vcard = 'BEGIN:VCARD\n' 
            + 'VERSION:3.0\n' 
            + 'FN:Didula Rashmika\n'
            + `ORG:Owner Of the ${config.botName};\n`
            + `TEL;type=CELL;type=VOICE;waid=${config.ownerNumber}:+${config.ownerNumber}\n`
            + 'END:VCARD';

        await conn.sendMessage(from, {
            contacts: {
                displayName: 'Didula Rashmika',
                contacts: [{ vcard }]
            },
            contextInfo: {
                externalAdReply: {
                    title: `Owner Of the ${config.botName}`,
                    body: "Contact for queries",
                    thumbnail: { url: config.aliveGif },
                    mediaType: 1,
                    showAdAttribution: true,
                }
            }
        }, { quoted: mek });

        await conn.sendMessage(from, {
            image: { url: config.aliveGif },
            caption: `*👤 DISULA MD SONG BOT Owner Information*\n\n`
                + `*Name:* Didula Rashmika\n`
                + `*Number:* +${config.ownerNumber}\n`
                + `*Role:* Owner Of the ${config.botName}\n\n`
                + `_Send .alive to check bot status_`
        }, { quoted: mek });
    } catch (error) {
        await errorHandler(error, conn, from, "Failed to get owner info");
    }
});

// Export necessary functions and variables
module.exports = {
    getLatestSong,
    sendSong,
    activeGroups,
    lastSongTitles,
    config
};
