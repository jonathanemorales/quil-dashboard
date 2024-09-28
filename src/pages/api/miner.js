import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
    const filePath = path.join(process.cwd(), 'src', 'data', 'minersData.json');

    if (req.method === 'POST') {
        try {
            const { minersData } = req.body;

            // Check if minersData exists and is an array
            if (!minersData || !Array.isArray(minersData)) {
                return res.status(400).json({ message: 'Invalid data format' });
            }

            // Store the received data into minersData.json file
            await fs.writeFile(filePath, JSON.stringify(minersData, null, 2), 'utf-8');

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