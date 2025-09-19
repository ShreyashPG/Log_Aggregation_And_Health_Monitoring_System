import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('1h');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      const [metricsResponse, analyticsResponse] = await Promise.all([
        api.get(`/metrics/dashboard?timerange=${timeRange}`),
        api.get('/logs/analytics?days=7')
      ]);

      setDashboardData({
        metrics: metricsResponse.data,
        analytics: analyticsResponse.data
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500" />
      </div>
    );
  }

  const { metrics, analytics } = dashboardData || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="1h">Last Hour</option>
          <option value="6h">Last 6 Hours</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
        </select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="CPU Usage"
          value={metrics?.system_metrics?.cpu_usage?.[0]?.values?.slice(-1)?.[0]?.[1] || '0'}
          unit="%"
          color="bg-blue-500"
        />
        <MetricCard
          title="Memory Usage"
          value={metrics?.system_metrics?.memory_usage?.[0]?.values?.slice(-1)?.[0]?.[1] || '0'}
          unit="%"
          color="bg-green-500"
        />
        <MetricCard
          title="Active Alerts"
          value={metrics?.alerts?.length || 0}
          unit=""
          color="bg-red-500"
        />
        <MetricCard
          title="Error Rate"
          value={metrics?.application_metrics?.error_rate?.[0]?.values?.slice(-1)?.[0]?.[1] || '0'}
          unit="%"
          color="bg-yellow-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Metrics Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formatMetricsData(metrics?.system_metrics)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="cpu" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="memory" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Error Trends */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Error Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formatErrorTrends(analytics?.error_trends)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="errors" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Log Level Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Log Level Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics?.level_distribution || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ _id, count }) => `${_id}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {(analytics?.level_distribution || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Service Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Service Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.service_activity || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, unit, color }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="flex items-center">
      <div className={`p-2 rounded-md ${color}`}>
        <div className="w-6 h-6 text-white" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">
          {parseFloat(value).toFixed(2)}{unit}
        </p>
      </div>
    </div>
  </div>
);

const formatMetricsData = (systemMetrics) => {
  if (!systemMetrics?.cpu_usage?.[0]?.values) return [];
  
  return systemMetrics.cpu_usage[0].values.map((item, index) => ({
    timestamp: new Date(item[0] * 1000).toLocaleTimeString(),
    cpu: parseFloat(item[1]),
    memory: systemMetrics.memory_usage?.[0]?.values?.[index]?.[1] ? parseFloat(systemMetrics.memory_usage[0].values[index][1]) : 0
  }));
};

const formatErrorTrends = (errorTrends) => {
  if (!errorTrends) return [];
  
  const grouped = errorTrends.reduce((acc, item) => {
    const date = item._id.date;
    if (!acc[date]) acc[date] = { date, errors: 0 };
    acc[date].errors += item.count;
    return acc;
  }, {});
  
  return Object.values(grouped);
};

export default Dashboard;
