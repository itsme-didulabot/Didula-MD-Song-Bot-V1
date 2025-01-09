
const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');
const yts = require("yt-search");
const axios = require('axios');
const mimeTypes = require('mime-types');
const db = require('../database'); // Import the database module
const aliveGif = 'didula.gif'; // Update the path accordingly



let activeGroups = {};
let lastSongTitles = {};
const searchQueries = ["Sinhala songs", "Slowed Reverb Sinhala", "New Sinhala Song", "මනෝපාරකට", "manoparakata"];
let searchIndex = 0;

// Function to fetch the latest song from YouTube
async function getLatestSong() {
    try {
        const searchQuery = searchQueries[searchIndex];
        const searchResult = await yts(searchQuery);
        const song = searchResult.all[0];

        if (!song) {
            throw new Error("No song found.");
        }

        const downloadInfo = await fetchJson(`https://apitest1-f7dcf17bd59b.herokuapp.com/download/ytmp3?url=${song.url}`);

        if (!downloadInfo.result || !downloadInfo.result.dl_link) {
            throw new Error("Failed to fetch download link.");
        }

        return {
            title: downloadInfo.result.title || song.title,
            artist: song.author.name,
            downloadUrl: downloadInfo.result.dl_link,
            thumbnail: song.thumbnail,
            audioUrl: downloadInfo.result.dl_link
        };
    } catch (error) {
        console.error(`Error fetching latest song: ${error.message}`);
        return null;
    }
}

// Function to send the latest song to a group
async function sendSong(conn, groupId, song) {
    if (song) {
        if (lastSongTitles[groupId] !== song.title) {
            lastSongTitles[groupId] = song.title;

            let message = `*🎧𝐃𝐢𝐝𝐮𝐥𝐚 𝐌𝐃 𝐒𝐨𝐧𝐠 𝐁𝐨𝐭🎧*\n\n*🎶 [song.title] 🎶*\n\n> *ᴛʜɪꜱ ɪꜱ ᴀᴜᴛᴏᴍᴀᴛɪᴄᴀʟʟʏ ꜱᴏɴɢ ꜱᴇɴᴅɪɴɡ ʙᴏᴛ*\n\n> *ᴄᴏɴᴛᴀᴄᴛ ᴏᴡɴᴇʀ*\n\nhttps://wa.me/message/DIDULLTK7ZOGH1\n\n> *ꜰᴏʟʟᴏᴡ ᴍʏ ᴄʜᴀɴᴇʟ*\n\nhttps://whatsapp.com/channel/0029VaqqF4GDTkJwKruLSK2f\n\n*© Projects of Didula Rashmika*`;

            try {
                const res = await axios.get(song.audioUrl, {
                    responseType: 'arraybuffer',
                    timeout: 15000
                });

                const mime = res.headers['content-type'] || 'application/octet-stream';
                const extension = mimeTypes.extension(mime) || 'unknown';
                const fileName = `${song.title}.${extension}`;

                await conn.sendMessage(groupId, {
                    document: { url: song.audioUrl },
                    caption: message,
                    mimetype: mime,
                    fileName: fileName
                });

                // Add the sent song to the database
                await db.addSentSong(groupId, song.title);
            } catch (err) {
                console.error(`Error sending song: ${err.message}`);
            }
        }
    }
}

// Function to check and post the latest song
async function checkAndPostSong(conn, groupId) {
    const latestSong = await getLatestSong();
    if (latestSong) {
        await sendSong(conn, groupId, latestSong);
    }
}

// Command to activate 24/7 song service in a group
cmd({
    pattern: "startsong",
    desc: "Enable automatic song updates in this group",
    isGroup: true,
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, participants }) => {
    try {
        const isAdmin = participants.some(p => p.id === mek.sender && p.admin);
        const isBotOwner = mek.sender === conn.user.jid;

        if (isAdmin || isBotOwner) {
            if (!activeGroups[from]) {
                activeGroups[from] = true;
                await db.addStartedGroup(from); // Save started group to the database
                await conn.sendMessage(from, { text: "🎵 Automatic song updates activated." });

                if (!activeGroups['interval']) {
                    activeGroups['interval'] = setInterval(async () => {
                        for (const groupId in activeGroups) {
                            if (activeGroups[groupId] && groupId !== 'interval') {
                                await checkAndPostSong(conn, groupId);
                            }
                        }
                        searchIndex = (searchIndex + 1) % searchQueries.length; // Cycle through search queries
                    }, 60000); // Run every 60 seconds
                }
            } else {
                await conn.sendMessage(from, { text: "🎵 Automatic song updates already activated." });
            }
        } else {
            await conn.sendMessage(from, { text: "🚫 This command can only be used by group admins or the bot owner." });
        }
    } catch (e) {
        console.error(`Error in startsong command: ${e.message}`);
        await conn.sendMessage(from, { text: "Failed to activate the music service." });
    }
});

// Command to deactivate the 24/7 song service
cmd({
    pattern: "stopsong",
    desc: "Disable automatic song updates in this group",
    isGroup: true,
    react: "🛑",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, participants }) => {
    try {
        const isAdmin = participants.some(p => p.id === mek.sender && p.admin);
        const isBotOwner = mek.sender === conn.user.jid;

        if (isAdmin || isBotOwner) {
            if (activeGroups[from]) {
                delete activeGroups[from];
                await db.removeStoppedGroup(from); // Save stopped group to the database
                await conn.sendMessage(from, { text: "🛑 Automatic song updates deactivated." });

                if (Object.keys(activeGroups).length === 1 && activeGroups['interval']) {
                    clearInterval(activeGroups['interval']);
                    delete activeGroups['interval'];
                }
            } else {
                await conn.sendMessage(from, { text: "🛑 Automatic song updates are not active in this group." });
            }
        } else {
            await conn.sendMessage(from, { text: "🚫 This command can only be used by group admins or the bot owner." });
        }
    } catch (e) {
        console.error(`Error in stopsong command: ${e.message}`);
        await conn.sendMessage(from, { text: "Failed to deactivate the music service." });
    }
});

// Command to check if the music service is active
cmd({
    pattern: "checksong",
    desc: "Check if the automatic song service is active in this group",
    isGroup: true,
    react: "🔍",
    filename: __filename
}, async (conn, mek, m, { from }) => {
    if (activeGroups[from]) {
        await conn.sendMessage(from, { text: "🎵 The automatic song service is currently active in this group." });
    } else {
        await conn.sendMessage(from, { text: "🛑 The automatic song service is not active in this group." });
    }
});





// Command to check if the bot is alive
cmd({
    pattern: "alive",
    desc: "Check if the bot is alive",
    isGroup: true,
    react: "💚",
    filename: __filename
}, async (conn, mek, m, { from }) => {
    const message = `*🤖 The bot is alive and running smoothly!*\n\n*🎶 Enjoy your day! 🎶*`;

    await conn.sendMessage(from, {
        text: message,
        caption: 'Here is a GIF to show I am alive!',
        video: { url: aliveGif }, // Sending as a video (GIF)
        mimetype: 'video/gif' // Specify MIME type
    });
});

// Command to display the menu
cmd({
    pattern: "menu",
    desc: "Display the command menu",
    isGroup: true,
    react: "🎧",
    filename: __filename
}, async (conn, mek, m, { from }) => {
    const menuMessage = `*✨ Command Menu ✨*\n\n` +
                        `1. *alive* - Check if the bot is alive\n` +
                        `2. *menu* - Display this command menu\n` +
                        `3. *ping* - Check bot response time\n` +
                        `\n*Enjoy using the bot! 💬*`;

    await conn.sendMessage(from, { text: menuMessage });
});

// Command to check the bot's response time
cmd({
    pattern: "ping",
    desc: "Check the bot's response time",
    isGroup: true,
    react: "🎶",
    filename: __filename
}, async (conn, mek, m, { from }) => {
    const start = Date.now();
    await conn.sendMessage(from, { text: '🏓 Pinging...' });
    const end = Date.now();
    
    const pingMessage = `*🎧 Pong!*\n\n*Response time: ${end - start} ms*`;
    await conn.sendMessage(from, { text: pingMessage });
});