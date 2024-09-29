import { getMinersDataCache } from '@/cache';

export default async function handler(req, res) {
    // Allow requests from any origin
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Allow specific HTTP methods
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');

    // Allow specific headers
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'GET') {
        try {
            // Read the miner data from the JSON file
            const minersData = getMinersDataCache();

            // Get the current time
            const now = new Date();
            const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            // Initialize an object to store summarized data for each peer_id
            const summary = {};
            const lastEntryByPeerId = {}; // Store the last entry for each peer_id

            const uniquePeerIds = [...new Set(minersData.map(item => item.peer_id))];

            uniquePeerIds.forEach(peerId => {
                const allEntries = minersData.filter(x => x.peer_id === peerId);

                //Minute
                const lastMinuteEntries = allEntries.filter(x => x.peer_id === peerId && new Date(x.timestamp) >= oneMinuteAgo);
                const balanceChangeMinute = lastMinuteEntries.length > 0 ? parseFloat(lastMinuteEntries[lastMinuteEntries.length - 1].balance - lastMinuteEntries[0].balance) : 0;

                //Minute
                const lastHourlyntries = allEntries.filter(x => x.peer_id === peerId && new Date(x.timestamp) >= oneMinuteAgo);
                const balanceChangeHourly = lastHourlyntries.length > 0 ? parseFloat(lastHourlyntries[lastHourlyntries.length - 1].balance - lastHourlyntries[0].balance) : 0;

                //Daily
                const lastDayEntries = allEntries.filter(x => x.peer_id === peerId && new Date(x.timestamp) >= oneDayAgo);
                const balanceChangeDaily = lastDayEntries.length > 0 ? parseFloat(lastDayEntries[lastDayEntries.length - 1].balance - lastDayEntries[0].balance) : 0;

                if (!summary[peerId]) {
                    summary[peerId] = {
                        earningsPastMinute: balanceChangeMinute,
                        earningsPastHour: balanceChangeHourly,
                        earningsPastDay: balanceChangeDaily,
                        lastBalance: allEntries?.length > 0 ? parseFloat(allEntries[allEntries.length - 1].balance) : 0, // Store the last balance to calculate differences
                    };
                }
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
