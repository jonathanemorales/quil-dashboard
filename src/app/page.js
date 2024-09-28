"use client"
import React, { useState } from 'react';
import styles from '../styles/Home.module.css'; // For styling
import { useEffect } from 'react';

export default function Home() {
  const [minersData, setMinerData] = useState([]);
  const [currentQuilPrice, setCurrentQuilPrice] = useState(0);

  useEffect(() => {
    // Define an async function to fetch the data
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data'); // Fetch data from your API endpoint
        const data = await response.json(); // Parse the JSON data
        setMinerData(Object.entries(data)); // Set the data to the state
      } catch (error) {
        console.error('Error fetching miner data:', error); // Handle any errors
      }
    };

    async function fetchPrice() {
      const url = "https://api.coingecko.com/api/v3/simple/price";
      const params = new URLSearchParams({
        ids: 'wrapped-quil',
        vs_currencies: 'usd'
      });

      try {
        const response = await fetch(`${url}?${params}`);
        const data = await response.json();
        setCurrentQuilPrice(data['wrapped-quil']?.usd || minersData)
      } catch (error) {
        console.error('Error fetching wQUIL price:', error);
        return 0; // Return 0 in case of an error
      }
    }

    fetchPrice();

    fetchData(); // Call the fetch function

    setInterval(() => {
      fetchData();
    }, 5000);

    setInterval(() => {
      fetchPrice();
    }, 60000);

  }, []); // Empty dependency array means it runs only once after the component mounts


  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Quilibrium Miners</h1>
      <h2>Current Quil Price: ${currentQuilPrice}</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Miner</th>
            <th>QUIL/Minute</th>
            <th>QUIL/Hour</th>
            <th>QUIL/Day</th>
            <th>USD/Minute</th>
            <th>USD/Hour</th>
            <th>USD/Day</th>
            <th>Total QUIL</th>
          </tr>
        </thead>
        <tbody>
          {minersData?.map((miner, index) => (
            <tr key={index}>
              <td>{miner[0]}</td>
              <td>{miner[1].earningsPastMinute.toFixed(4)}</td>
              <td>{miner[1].earningsPastHour.toFixed(4)}</td>
              <td>{miner[1].earningsPastDay.toFixed(4)}</td>
              <td>${(miner[1].earningsPastMinute * currentQuilPrice).toFixed(2)}</td>
              <td>${(miner[1].earningsPastHour * currentQuilPrice).toFixed(2)}</td>
              <td>${(miner[1].earningsPastDay * currentQuilPrice).toFixed(2)}</td>
              <th>{miner[1].lastBalance.toFixed(0)}</th>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
