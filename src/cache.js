// cache.js

import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src', 'data', 'minersData.json');

// In-memory cache for miner data
let minersDataCache = [];
let isCacheDirty = false;
let isCacheLocked = false; // Mutex for locking the cache

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Load minersData from the file into the cache when the server starts
export async function loadMinersData() {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        minersDataCache = JSON.parse(data);
        console.log('Miners data loaded into cache');
    } catch (error) {
        console.error('Error loading miners data:', error);
        minersDataCache = []; // Initialize an empty cache if file read fails
    }
}

// Function to flush the cache to the file
export async function flushCacheToFile() {
    if (isCacheDirty) {
        try {
            await fs.writeFile(filePath, JSON.stringify(minersDataCache, null, 2));
            console.log('Cache flushed to file');
            isCacheDirty = false; // Reset the dirty flag after successful write
        } catch (error) {
            console.error('Error writing miners data to file:', error);
        }
    }
}

// Function to get the current cache
export function getMinersDataCache() {
    return minersDataCache;
}

// Function to add a miner to the cache and mark it as dirty
export async function addMinerToCache(newMiner) {

    // Wait until the cache is not locked
    while (isCacheLocked) {
        await sleep(50); // Wait for 50ms before checking again
    }

    // Lock the cache for this operation
    isCacheLocked = true;

    try {
        // Modify the cache
        minersDataCache.push(newMiner);
        isCacheDirty = true; // Mark the cache as dirty so it gets written to the file
    } finally {
        // Release the lock after the operation is done
        isCacheLocked = false;
    }
}

export async function addData(data) {
    // Wait until the cache is not locked
    while (isCacheLocked) {
        await sleep(50); // Wait for 50ms before checking again
    }

    // Lock the cache for this operation
    isCacheLocked = true;

    try {
        // Modify the cache
        minersDataCache.push(data);
        isCacheDirty = true; // Mark the cache as dirty so it gets written to the file
    } finally {
        // Release the lock after the operation is done
        isCacheLocked = false;
    }
}

// Start the periodic cache flush every 5 seconds
setInterval(flushCacheToFile, 5000);

// Load the miners data into the cache when the module is imported
loadMinersData();
