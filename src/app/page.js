"use client";
import BarChart from "@/components/barChart";
import React, { useState, useEffect, useCallback } from "react";

export default function Home() {
  const [minersData, setMinerData] = useState([]);
  const [currentQuilPrice, setCurrentQuilPrice] = useState(0);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    var data = mapDataForChart(minersData);
    setChartData(data);
  }, [minersData]);

  useEffect(() => {
    // Define an async function to fetch the data
    const fetchData = async () => {
      try {
        const response = await fetch("/api/data"); // Fetch data from your API endpoint
        const data = await response.json(); // Parse the JSON data
        data.sort((a,b) => b.earningsPastMinute - a.earningsPastMinute)
        setMinerData(data); // Set the data to the state
        setChartData(mapDataForChart(data));
      } catch (error) {
        console.error("Error fetching miner data:", error); // Handle any errors
      }
    };

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

    // Set intervals for recurring fetches
    // const dataInterval = setInterval(fetchData, 5000); // Fetch every 5 seconds
    // const priceInterval = setInterval(fetchPrice, 60000); // Fetch every 60 seconds

    // // Clean up intervals when the component unmounts
    // return () => {
    //   clearInterval(dataInterval);
    //   clearInterval(priceInterval);
    // };
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
      const storedLabel = localStorage.getItem(miner.peerId);
      const minerElement = document.querySelector(`[data-peer-id="${miner.peerId}"]`);
      if (minerElement) {
        const labelSpan = minerElement.querySelector('.label');

        if (storedLabel) {
          labelSpan.textContent = `${storedLabel}`;
        } else {
          labelSpan.textContent = `${miner.peerId}`;
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

  // Mapping function to transform the data
  const mapDataForChart = (data) => {
    if (data && data.length >0) {
      return data.map(entry => ({
        user: entry.peerId,  // If `timestamp` is null or undefined, set to null
        values: entry.hourly,  // If `value` is null or undefined, set to 0 or any default value you prefer
      }));
    }
    return [];
  };

  return (
    <div className="container">
      <h1 className="title">Quilibrium Miners</h1>
      <h2 className="title">Current Quil Price: ${currentQuilPrice.toFixed(2)}</h2>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Miner</th>
              <th>Ring</th>
              <th>QUIL/Minute</th>
              <th>QUIL/Hour</th>
              <th>QUIL/Day</th>
              <th>USD/Minute</th>
              <th>USD/Hour</th>
              <th>USD/Day</th>
              <th>USD/Month</th>
              <th>Total QUIL</th>
            </tr>
          </thead>
          <tbody>
            {minersData?.map((miner, index) => (
              <tr key={index}>
                <td className="miner-name" data-peer-id={miner?.peerId}>
                  <span className="label"></span>
                </td>
                <td>{miner?.ring}</td>
                <td>{miner?.earningsPastMinute?.toFixed(4)}</td>
                <td>{miner?.earningsPastHour?.toFixed(4)}</td>
                <td>{miner?.earningsPastDay?.toFixed(4)}</td>
                <td>${(miner?.earningsPastMinute * currentQuilPrice).toFixed(2)}</td>
                <td>${(miner?.earningsPastHour * currentQuilPrice).toFixed(2)}</td>
                <td>${(miner?.earningsPastDay * currentQuilPrice).toFixed(2)}</td>
                <td>${(miner?.earningsPastMonth * currentQuilPrice).toFixed(2)}</td>
                <th>{miner?.lastBalance?.toFixed(0)}</th>
              </tr>
            ))}
            <tr>
              <td><strong>Totals</strong></td>
              <td></td>
              <td>{minersData?.reduce((acc, miner) => acc + miner.earningsPastMinute, 0).toFixed(4)}</td>
              <td>{minersData?.reduce((acc, miner) => acc + miner.earningsPastHour, 0).toFixed(4)}</td>
              <td>{minersData?.reduce((acc, miner) => acc + miner.earningsPastDay, 0).toFixed(4)}</td>
              <td>${minersData?.reduce((acc, miner) => acc + (miner.earningsPastMinute * currentQuilPrice), 0).toFixed(2)}</td>
              <td>${minersData?.reduce((acc, miner) => acc + (miner.earningsPastHour * currentQuilPrice), 0).toFixed(2)}</td>
              <td>${minersData?.reduce((acc, miner) => acc + (miner.earningsPastDay * currentQuilPrice), 0).toFixed(2)}</td>
              <td>${minersData?.reduce((acc, miner) => acc + (miner.earningsPastMonth * currentQuilPrice), 0).toFixed(2)}</td>
              <td>{minersData?.reduce((acc, miner) => acc + miner.lastBalance, 0).toFixed(0)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {
        chartData.length > 0 && <BarChart data={chartData} />
      }
    </div>
  );
}
