const fs = require('fs');
const path = require('path');

const dbFilePath = path.join(__dirname, 'database.json');

// Initialize the database if it doesn't exist
if (!fs.existsSync(dbFilePath)) {
    fs.writeFileSync(dbFilePath, JSON.stringify({ startedGroups: {}, stoppedGroups: {}, sentSongs: [] }, null, 2));
}

// Function to read the database
function readDatabase() {
    const data = fs.readFileSync(dbFilePath);
    return JSON.parse(data);
}

// Function to write the database
function writeDatabase(data) {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
}

// Function to add a started group
function addStartedGroup(groupId) {
    const db = readDatabase();
    db.startedGroups[groupId] = true;
    writeDatabase(db);
}

// Function to remove a stopped group
function removeStoppedGroup(groupId) {
    const db = readDatabase();
    db.stoppedGroups[groupId] = true;
    writeDatabase(db);
}

// Function to add a sent song
function addSentSong(groupId, songTitle) {
    const db = readDatabase();
    db.sentSongs.push({ groupId, songTitle });
    writeDatabase(db);
}

// Export the functions
module.exports = {
    addStartedGroup,
    removeStoppedGroup,
    addSentSong,
    readDatabase
};