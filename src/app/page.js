import React from 'react';
import styles from '../styles/Home.module.css'; // For styling

export default function Home() {
  const minersData = [
    {
      miner: 'Miner 1',
      quilPerHour: 50,
      quilPerMinute: 0.83,
      quilPerDay: 1200,
      usdPerHour: 10,
      usdPerMinute: 0.17,
      usdPerDay: 240
    },
    {
      miner: 'Miner 2',
      quilPerHour: 60,
      quilPerMinute: 1,
      quilPerDay: 1440,
      usdPerHour: 12,
      usdPerMinute: 0.20,
      usdPerDay: 288
    },
    {
      miner: 'Miner 3',
      quilPerHour: 45,
      quilPerMinute: 0.75,
      quilPerDay: 1080,
      usdPerHour: 9,
      usdPerMinute: 0.15,
      usdPerDay: 216
    },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Quilibrium Miners</h1>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Miner</th>
            <th>QUIL/Hour</th>
            <th>QUIL/Minute</th>
            <th>QUIL/Day</th>
            <th>USD/Hour</th>
            <th>USD/Minute</th>
            <th>USD/Day</th>
          </tr>
        </thead>
        <tbody>
          {minersData.map((miner, index) => (
            <tr key={index}>
              <td>{miner.miner}</td>
              <td>{miner.quilPerHour}</td>
              <td>{miner.quilPerMinute}</td>
              <td>{miner.quilPerDay}</td>
              <td>${miner.usdPerHour}</td>
              <td>${miner.usdPerMinute}</td>
              <td>${miner.usdPerDay}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
