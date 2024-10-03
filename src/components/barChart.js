import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,   // Import CategoryScale
    LinearScale,    // Import LinearScale for the Y axis
    BarElement,     // Import BarElement for bar charts
    Title,          // Optional: For title configuration
    Tooltip,        // Optional: For tooltips
    Legend          // Optional: For legend configuration
} from 'chart.js';
import moment from 'moment';

// Register the components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const BarChart = ({ data }) => {
    // Ensure data exists and has at least one user with values
    const commonTimestamps = data?.[0]?.values
        ? data[0].values.map(item =>
            moment(item.timestamp).format('hh:mm')
        )
        : [];  // If data or values are undefined, default to an empty array

    const datasets = data
        ? data.map(user => ({
            label: user.user,  // Name of the user
            data: user.values ? user.values.map(item => item.value) : [],  // Corresponding Y values or empty array
            backgroundColor: getRandomColor(),  // Assign a different color to each user
            borderColor: getRandomColor(),
            borderWidth: 1,
        }))
        : [];  // Default to an empty array if no data is present

    const chartData = {
        labels: commonTimestamps,  // X-axis labels
        datasets: datasets,  // Datasets for each user
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Hourly Growth',
            },
        },
        scales: {
            x: {
                ticks: {
                    maxTicksLimit: 12,
                },
                title: {
                    display: true,
                    text: 'Time',
                },
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'QUIL / Hour',
                  },
            },
        },
    };

    function getRandomColor() {
        const letters = '01234567';  // Limit to darker color range
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * letters.length)];
        }
        return color;
    }


    return <Bar data={chartData} options={options} />;
};

export default BarChart;
