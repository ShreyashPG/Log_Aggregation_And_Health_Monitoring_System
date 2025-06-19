import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Log {
  _id: string;
  service: string;
  message: string;
  level: string;
  timestamp: string;
}

interface LogViewerProps {
  token: string;
}

const LogViewer: React.FC<LogViewerProps> = ({ token }) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [service, setService] = useState('');
  const [level, setLevel] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (service) params.append('service', service);
      if (level) params.append('level', level);
      if (keyword) params.append('keyword', keyword);

      const res = await axios.get(`http://localhost:8080/api/logs?${params.toString()}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      setLogs(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch logs');
      console.error('Logs fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchLogs();
    }
  }, [token]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error': return 'text-red-600 bg-red-100';
      case 'warn': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-xl mb-4">Logs</h3>
      
      <form onSubmit={handleSearch} className="mb-6 bg-white p-4 rounded shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="Service (e.g., backend)"
            className="p-2 border rounded focus:outline-none focus:border-blue-500"
          />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="p-2 border rounded focus:outline-none focus:border-blue-500"
          >
            <option value="">All Levels</option>
            <option value="info">Info</option>
            <option value="error">Error</option>
            <option value="warn">Warn</option>
            <option value="debug">Debug</option>
          </select>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Keyword"
            className="p-2 border rounded focus:outline-none focus:border-blue-500"
          />
          <button 
            type="submit" 
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="border-b p-3 text-left">Service</th>
                <th className="border-b p-3 text-left">Level</th>
                <th className="border-b p-3 text-left">Message</th>
                <th className="border-b p-3 text-left">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center">Loading logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">No logs found</td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="border-b p-3">{log.service}</td>
                    <td className="border-b p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                    </td>
                    <td className="border-b p-3 max-w-md truncate" title={log.message}>
                      {log.message}
                    </td>
                    <td className="border-b p-3 text-sm text-gray-600">
                      {formatTimestamp(log.timestamp)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LogViewer;