import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Get current date for the query
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
        
        const startISO = startTime.toISOString();
        const endISO = endTime.toISOString();
        
        const res = await axios.get(
          `http://localhost:9090/api/v1/query_range?query=api_requests_total&start=${startISO}&end=${endISO}&step=15m`,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          }
        );
        
        if (res.data?.data?.result?.[0]?.values) {
          const data = res.data.data.result[0].values.map(([ts, value]: [number, string]) => ({
            timestamp: new Date(ts * 1000).toLocaleTimeString(),
            value: parseFloat(value),
          }));
          setMetrics(data);
        } else {
          setMetrics([]);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch metrics');
        console.error('Metrics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchMetrics();
      // Refresh metrics every 30 seconds
      const interval = setInterval(fetchMetrics, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl mb-4">API Request Metrics</h2>
        <div className="bg-white p-4 rounded shadow flex items-center justify-center h-64">
          <p>Loading metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <h2 className="text-xl mb-4">API Request Metrics</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl mb-4">API Request Metrics (Last 24 Hours)</h2>
      <div className="bg-white p-4 rounded shadow">
        {metrics.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No metrics data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ r: 4 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default MetricsChart;