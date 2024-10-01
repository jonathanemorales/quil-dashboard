"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


export default function Home() {
  const [minersData, setMinerData] = useState([]);
  const [currentQuilPrice, setCurrentQuilPrice] = useState(0);
  const [hourlyData, setHourlyData] = useState([]);

  useEffect(() => {
    // Define an async function to fetch the data
    const fetchData = async () => {
      try {
        const response = await fetch("/api/data"); // Fetch data from your API endpoint
        const data = await response.json(); // Parse the JSON data
        setMinerData(Object.entries(data)); // Set the data to the state
      } catch (error) {
        console.error("Error fetching miner data:", error); // Handle any errors
      }
    };

    // Fetch the hourly growth data from the API
    async function fetchHourlyData() {
      const response = await fetch('/api/hourly-growth');
      const data = await response.json();
      setHourlyData(data);
    }
    const fetchPrice = async () => {
      const url = "https://api.coingecko.com/api/v3/simple/price";
      const params = new URLSearchParams({
        ids: "wrapped-quil",
        vs_currencies: "usd",
      });

      try {
        const response = await fetch(`${url}?${params}`);
        const data = await response.json();
        setCurrentQuilPrice(data["wrapped-quil"]?.usd || 0); // Fallback to 0 instead of minersData
      } catch (error) {
        console.error("Error fetching wQUIL price:", error);
      }
    };

    // Initial data fetch
    fetchPrice();
    fetchData();
    fetchHourlyData();

    // Set intervals for recurring fetches
    const dataInterval = setInterval(fetchData, 5000); // Fetch every 5 seconds
    const priceInterval = setInterval(fetchPrice, 60000); // Fetch every 60 seconds

    // Clean up intervals when the component unmounts
    return () => {
      clearInterval(dataInterval);
      clearInterval(priceInterval);
    };
  }, []); // Empty dependency array means it runs only once after the component mounts

  const handleLabelUpdate = useCallback((event) => {
    const col = event.currentTarget;
    const peerId = col.getAttribute('data-peer-id');
    const label = prompt(`Add a label for miner ${peerId}:`, "");
    if (label) {
      // Save the label to localStorage
      localStorage.setItem(peerId, label);
      // Update the label on the page
      const labelSpan = col.querySelector('.label');
      labelSpan.textContent = `${label}`;
    }
  }, []);

  useEffect(() => {
    // Load labels from localStorage when the component is mounted
    minersData.forEach((miner) => {
      const storedLabel = localStorage.getItem(miner[0]);
      const minerElement = document.querySelector(`[data-peer-id="${miner[0]}"]`);
      if (minerElement) {
        const labelSpan = minerElement.querySelector('.label');

        if (storedLabel) {
          labelSpan.textContent = `${storedLabel}`;
        } else {
          labelSpan.textContent = `${miner[0]}`;
        }
      }
    });

    // Select all miner name columns and add the click event listener
    const minerColumns = document.querySelectorAll('.miner-name');
    minerColumns.forEach((col) => {
      col.addEventListener('click', handleLabelUpdate);
    });

    // Cleanup function: Remove event listeners on unmount
    return () => {
      minerColumns.forEach((col) => {
        col.removeEventListener('click', handleLabelUpdate);
      });
    };
  }, [minersData, handleLabelUpdate]);

    // Group data by peer_id
    const groupedData = hourlyData.reduce((acc, entry) => {
      const peerId = entry.peer_id;
      if (!acc[peerId]) {
        acc[peerId] = [];
      }
      acc[peerId].push(entry);
      return acc;
    }, {});
  
    // Prepare datasets for each peer_id
    const datasets = Object.keys(groupedData).map(peerId => {
      return {
        label: `Peer ID: ${peerId}`,
        data: groupedData[peerId].map(entry => entry.balanceGrowth),
        borderColor: getRandomColor(), // You can generate random colors for each peer_id
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.2,
      };
    });
  
    // Prepare chart data with labels (time) and datasets
    const chartData = {
      labels: hourlyData.map(entry => new Date(entry.time).toLocaleTimeString()), // X-axis: time (hours)
      datasets: datasets, // Y-axis: balance growth for each peer_id
    };
  
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Hourly Balance Growth by Peer ID',
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Time',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Balance Growth',
          },
        },
      },
    };
  
    // Function to generate a random color for each dataset
    function getRandomColor() {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }

  return (
    <div className="container">
      <h1 className="title">Quilibrium Miners</h1>
      <h2 className="title">Current Quil Price: ${currentQuilPrice.toFixed(4)}</h2>
      <div className="table-wrapper">
        <table className="table">
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
                <td className="miner-name" data-peer-id={miner[0]}>
                  <span className="label"></span>
                </td>
                <td>{miner[1]?.earningsPastMinute?.toFixed(4)}</td>
                <td>{miner[1]?.earningsPastHour?.toFixed(4)}</td>
                <td>{miner[1]?.earningsPastDay?.toFixed(4)}</td>
                <td>${(miner[1]?.earningsPastMinute * currentQuilPrice).toFixed(2)}</td>
                <td>${(miner[1]?.earningsPastHour * currentQuilPrice).toFixed(2)}</td>
                <td>${(miner[1]?.earningsPastDay * currentQuilPrice).toFixed(2)}</td>
                <th>{miner[1]?.lastBalance?.toFixed(0)}</th>
              </tr>
            ))}
            <tr>
              <td><strong>Totals</strong></td>
              <td>{minersData?.reduce((acc, miner) => acc + miner[1].earningsPastMinute, 0).toFixed(4)}</td>
              <td>{minersData?.reduce((acc, miner) => acc + miner[1].earningsPastHour, 0).toFixed(4)}</td>
              <td>{minersData?.reduce((acc, miner) => acc + miner[1].earningsPastDay, 0).toFixed(4)}</td>
              <td>${minersData?.reduce((acc, miner) => acc + (miner[1].earningsPastMinute * currentQuilPrice), 0).toFixed(2)}</td>
              <td>${minersData?.reduce((acc, miner) => acc + (miner[1].earningsPastHour * currentQuilPrice), 0).toFixed(2)}</td>
              <td>${minersData?.reduce((acc, miner) => acc + (miner[1].earningsPastDay * currentQuilPrice), 0).toFixed(2)}</td>
              <td>{minersData?.reduce((acc, miner) => acc + miner[1].lastBalance, 0).toFixed(0)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="chartContainer">
        <h1>Hourly Growth</h1>
        <div className="chart">
          <Line data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
}
