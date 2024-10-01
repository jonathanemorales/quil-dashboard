import { getMinersDataCache } from '../../cache';

export default async function handler(req, res) {
    const minersData = getMinersDataCache();

    const hourlyGrowth = [];

    let startTime = new Date(minersData[0].timestamp);
    startTime.setMinutes(0, 0, 0);

    let endTime = new Date(minersData[0].timestamp);
    endTime.setHours(endTime.getHours() + 1);

    const lastTime = new Date(minersData[minersData.length -1 ].timestamp);
    lastTime.setMinutes(0, 0, 0);
    lastTime.setHours(lastTime.getHours() + 1);


    // Iterate over each hour in the last 168 hours
    while(endTime <= lastTime) {
        // Filter the minersData to get entries within this hour
        const entriesInHour = minersData.filter(entry => {
            const entryTime = new Date(entry.timestamp);
            return entryTime >= startTime && entryTime <= endTime;
        });

        // Group the entries by peer_id
        const peerIdGroups = entriesInHour.reduce((acc, entry) => {
            if (!acc[entry.peer_id]) {
                acc[entry.peer_id] = [];
            }
            acc[entry.peer_id].push(entry);
            return acc;
        }, {});

        // Calculate total balance growth for this hour
        let totalBalanceGrowth = 0;

        // Iterate through each peer_id and calculate their balance growth
        for (const peerId in peerIdGroups) {
            const peerEntries = peerIdGroups[peerId];
            if (peerEntries.length > 0) {
                const initialBalance = parseFloat(peerEntries[0].balance);
                const finalBalance = parseFloat(peerEntries[peerEntries.length - 1].balance);
                totalBalanceGrowth += finalBalance - initialBalance;

                hourlyGrowth.push({
                    peer_id: peerId,
                    time: startTime.toISOString(), // Store as ISO string for frontend compatibility
                    balanceGrowth: totalBalanceGrowth
                });
            }
        }

        // Add the result to the hourly growth array


        startTime.setHours(startTime.getHours() + 1);
        endTime.setHours(endTime.getHours() + 1);
    }

    return res.json(hourlyGrowth);
}
