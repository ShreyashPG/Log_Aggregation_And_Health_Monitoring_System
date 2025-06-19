import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsResult {
  service: string;
  errorCount: number;
}

interface AnalyticsChartProps {
  token: string;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ token }) => {
  const [data, setData] = useState<AnalyticsResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get('http://localhost:8080/analytics', {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        setData(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch analytics');
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchAnalytics();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="text-xl mb-4">Error Log Analytics (Last 24 Hours)</h3>
        <div className="flex items-center justify-center h-64">
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <h3 className="text-xl mb-4">Error Log Analytics (Last 24 Hours)</h3>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl mb-4">Error Log Analytics (Last 24 Hours)</h3>
      <div className="bg-white p-4 rounded shadow">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="service" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="errorCount" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsChart;