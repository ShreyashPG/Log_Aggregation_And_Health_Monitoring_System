import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';

interface Metric {
  timestamp: string;
  value: number;
}

interface MetricsChartProps {
  token: string;
}

const MetricsChart: React.FC<MetricsChartProps> = ({ token }) => {
  const [metrics, setMetrics] = useState<Metric[]>([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await axios.get('http://localhost:9090/api/v1/query_range?query=api_requests_total&start=2025-05-18T00:00:00Z&end=2025-05-18T23:59:59Z&step=15s', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data.data.result[0]?.values.map(([ts, value]: [number, string]) => ({
          timestamp: new Date(ts * 1000).toISOString(),
          value: parseFloat(value),
        }));
        setMetrics(data || []);
      } catch (err) {
        console.error('Failed to fetch metrics');
      }
    };
    fetchMetrics();
  }, [token]);

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">API Request Metrics</h2>
      <LineChart width={600} height={300} data={metrics}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
    </div>
  );
};

export default MetricsChart;