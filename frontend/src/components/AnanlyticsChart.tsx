import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface AnalyticsResult {
  service: string;
  errorCount: number;
}

const AnalyticsChart: React.FC = () => {
  const [data, setData] = useState<AnalyticsResult[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('http://localhost:8080/analytics', {
          headers: { Authorization: localStorage.getItem('token') || '' },
        });
        setData(res.data);
      } catch (err) {
        alert('Failed to fetch analytics');
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="mt-8">
      <h3 className="text-xl mb-4">Error Log Analytics (Last 24 Hours)</h3>
      <BarChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="service" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="errorCount" fill="#8884d8" />
      </BarChart>
    </div>
  );
};

export default AnalyticsChart;