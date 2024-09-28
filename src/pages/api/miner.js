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

    if (req.method === 'POST') {
        try {
            let existingData = [];
            const data = await fs.readFile(filePath, 'utf-8');
            existingData = JSON.parse(data);
            existingData.push(req.body)
            // Store the received data into minersData.json file
            await fs.writeFile(filePath, JSON.stringify(existingData, null, 2), 'utf-8');

            return res.status(200).json({ message: 'Data saved successfully' });
        } catch (error) {
            return res.status(500).json({ message: 'Failed to save data', error });
        }
    } else if (req.method === 'GET') {
        try {
            // Read and return the data from minersData.json
            const data = await fs.readFile(filePath, 'utf-8');
            const minersData = JSON.parse(data);

            return res.status(200).json(minersData);
        } catch (error) {
            return res.status(500).json({ message: 'Failed to retrieve data', error });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
}