import { addData, getMinersDataCache } from '../../cache';

export default async function handler(req, res) {
    // Allow requests from any origin
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Allow specific HTTP methods
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');

    // Allow specific headers
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'POST') {
        try {
            if(req.body.balance){
                addData(req.body);
            }
            return res.status(200).json({ message: 'Data saved successfully' });
        } catch (error) {
            return res.status(500).json({ message: 'Failed to save data', error });
        }
    } else if (req.method === 'GET') {
        try {
            // Read and return the data from minersData.json
            const data = getMinersDataCache();

            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ message: 'Failed to retrieve data', error });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
}