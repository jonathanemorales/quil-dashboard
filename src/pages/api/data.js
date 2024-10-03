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
            const cachedData = getMinersDataCache();

            const minersData = cachedData
                .map(entry => ({
                    ...entry,
                    timestamp: new Date(entry.timestamp)  // Convert the timestamp to a Date object
                }));

            // Get the current time
            const now = new Date().getTime();
            const oneMinuteAgo = new Date(now - 60000);
            const oneHourAgo = new Date(now - 3600000);
            const oneDayAgo = new Date(now - 86400000);

            // Initialize an object to store summarized data for each peer_id
            const summary = {};

            const uniquePeerIds = [...new Set(minersData.map(item => item.peer_id))];

            uniquePeerIds.forEach(peerId => {
                const allEntries = minersData.filter(x => x.peer_id === peerId);

                const hourlyData = []

                //Daily
                const lastDayEntries = allEntries.filter(x => x.timestamp >= oneDayAgo);
                const balanceChangeDaily = lastDayEntries.length > 0 ? parseFloat(lastDayEntries[lastDayEntries.length - 1].balance - lastDayEntries[0].balance) : 0;

                //Minute
                const lastHourlyntries = lastDayEntries.filter(x => x.timestamp >= oneHourAgo);
                const balanceChangeHourly = lastHourlyntries.length > 0 ? parseFloat(lastHourlyntries[lastHourlyntries.length - 1].balance - lastHourlyntries[0].balance) : 0;

                //Minute
                const lastMinuteEntries = lastHourlyntries.filter(x => x.timestamp >= oneMinuteAgo);
                const balanceChangeMinute = lastMinuteEntries.length > 0 ? parseFloat(lastMinuteEntries[lastMinuteEntries.length - 1].balance - lastMinuteEntries[0].balance) : 0;

                if (!summary[peerId]) {
                    summary[peerId] = {
                        earningsPastMinute: balanceChangeMinute,
                        earningsPastHour: balanceChangeHourly,
                        earningsPastDay: balanceChangeDaily,
                        lastBalance: allEntries?.length > 0 ? parseFloat(allEntries[allEntries.length - 1].balance) : 0, // Store the last balance to calculate differences
                    };
                }

                const lastTimestamp = new Date(allEntries[allEntries.length - 1].timestamp);
                let twelveHoursAgo = new Date(lastTimestamp.getTime() - 12 * 60 * 60 * 1000);
                twelveHoursAgo.setMinutes(0, 0, 0);

                for (let i = 0; i < 12; i++) { // Change to start from 0 to 11 for 12 iterations
                    const hourAgo = new Date(twelveHoursAgo.getTime() + i * 3600000); // Calculate the time for each hour
                    const hourlyEntries = lastDayEntries.filter(x => x.timestamp >= hourAgo && x.timestamp < hourAgo.getTime() + 3600000);
                    
                    const hourlyChange = hourlyEntries.length > 0 
                        ? parseFloat(hourlyEntries[hourlyEntries.length - 1].balance - hourlyEntries[0].balance) 
                        : 0;
                
                    hourlyData.push({
                        timestamp: hourAgo,
                        value: hourlyChange
                    });
                }                

                summary[peerId].hourly = hourlyData
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
