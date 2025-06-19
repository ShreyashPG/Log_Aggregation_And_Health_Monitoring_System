import React from 'react';
import LogViewer from '../components/LogViewer';
import MetricsChart from '../components/MetricsChart';
import AnalyticsChart from '../components/AnalyticsChart';

interface DashboardProps {
  token: string | null;
}

const Dashboard: React.FC<DashboardProps> = ({ token }) => {
  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Please log in to access the dashboard</h2>
          <a href="/login" className="bg-blue-500 text-white px-4 py-2 rounded">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl">Log Aggregation & Monitoring</h1>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      <LogViewer token={token} />
      <MetricsChart token={token} />
      <AnalyticsChart token={token} />
    </div>
  );
};

export default Dashboard;