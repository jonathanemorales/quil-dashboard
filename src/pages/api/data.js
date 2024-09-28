import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
    // Allow requests from any origin
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Allow specific HTTP methods
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');

    // Allow specific headers
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    const filePath = path.join(process.cwd(), 'src', 'data', 'minersData.json');

    if (req.method === 'GET') {
        try {
            // Read the miner data from the JSON file
            const data = await fs.readFile(filePath, 'utf-8');
            const minersData = JSON.parse(data);

            // Get the current time
            const now = new Date();
            const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            // Initialize an object to store summarized data for each peer_id
            const summary = {};
            const lastEntryByPeerId = {}; // Store the last entry for each peer_id

            // Iterate over the miner data to calculate earnings by peer_id
            minersData.forEach((entry) => {
                const { peer_id, balance, timestamp } = entry;
                const entryTime = new Date(timestamp);
                const currentBalance = parseFloat(balance);

                // Initialize peer_id in summary if not already present
                if (!summary[peer_id]) {
                    summary[peer_id] = {
                        earningsPastMinute: 0,
                        earningsPastHour: 0,
                        earningsPastDay: 0,
                        lastBalance: currentBalance, // Store the last balance to calculate differences
                    };
                }

                // Check if the last entry for this peer_id exists, otherwise set it to the current entry
                if (!lastEntryByPeerId[peer_id]) {
                    lastEntryByPeerId[peer_id] = entry;
                }

                const previousEntry = lastEntryByPeerId[peer_id];
                const previousBalance = parseFloat(previousEntry.balance);

                // Calculate the balance change for this entry compared to the previous one
                const balanceChange = currentBalance - previousBalance;

                // Check if the timestamp is within the last minute, hour, or day
                if (entryTime >= oneMinuteAgo) {
                    summary[peer_id].earningsPastMinute += balanceChange;
                }
                if (entryTime >= oneHourAgo) {
                    summary[peer_id].earningsPastHour += balanceChange;
                }
                if (entryTime >= oneDayAgo) {
                    summary[peer_id].earningsPastDay += balanceChange;
                }

                // Update the last entry for this peer_id with the current entry
                lastEntryByPeerId[peer_id] = entry;

                // Update the last balance for the peer_id in the summary object
                summary[peer_id].lastBalance = currentBalance;
            });

            // Return the summarized data for all peer_ids
            return res.status(200).json(summary);
        } catch (error) {
            return res.status(500).json({ message: 'Failed to retrieve or process data', error });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
}
