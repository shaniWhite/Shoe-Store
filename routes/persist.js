const fs = require('fs').promises;
const path = require('path');

// Function to read data from a JSON file asynchronously
async function readData(fileName) {
    try {
        const filePath = path.join(__dirname, '../data', fileName);
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading file ${fileName}:`, err);
        throw err;
    }
}

// Function to write data to a JSON file asynchronously
async function writeData(fileName, data) {
    try {
        const filePath = path.join(__dirname, '../data', fileName);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(`Error writing file ${fileName}:`, err);
        throw err;
    }
}

module.exports = {
    readData,
    writeData,
};
