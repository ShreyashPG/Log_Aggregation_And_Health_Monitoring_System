// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// interface Log {
//   timestamp: string;
//   service: string;
//   message: string;
//   level: string;
// }

// interface LogViewerProps {
//   token: string;
// }

// const LogViewer: React.FC<LogViewerProps> = ({ token }) => {
//   const [logs, setLogs] = useState<Log[]>([]);
//   const [service, setService] = useState('');
//   const [level, setLevel] = useState('');

//   useEffect(() => {
//     const fetchLogs = async () => {
//       try {
//         const res = await axios.get('http://localhost:8080/api/logs', {
//           headers: { Authorization: `Bearer ${token}` },
//           params: { service, level },
//         });
//         setLogs(res.data);
//       } catch (err) {
//         console.error('Failed to fetch logs');
//       }
//     };
//     fetchLogs();
//   }, [service, level, token]);

//   return (
//     <div className="p-4">
//       <h2 className="text-xl mb-4">Logs</h2>
//       <div className="mb-4">
//         <input
//           type="text"
//           placeholder="Filter by service"
//           value={service}
//           onChange={(e) => setService(e.target.value)}
//           className="p-2 border rounded mr-2"
//         />
//         <input
//           type="text"
//           placeholder="Filter by level"
//           value={level}
//           onChange={(e) => setLevel(e.target.value)}
//           className="p-2 border rounded"
//         />
//       </div>
//       <table className="w-full border-collapse">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="p-2">Timestamp</th>
//             <th className="p-2">Service</th>
//             <th className="p-2">Message</th>
//             <th className="p-2">Level</th>
//           </tr>
//         </thead>
//         <tbody>
//           {logs.map((log, index) => (
//             <tr key={index} className="border-b">
//               <td className="p-2">{log.timestamp}</td>
//               <td className="p-2">{log.service}</td>
//               <td className="p-2">{log.message}</td>
//               <td className="p-2">{log.level}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default LogViewer; 

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Log {
  _id: string;
  service: string;
  message: string;
  level: string;
  timestamp: string;
}

const LogViewer: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [service, setService] = useState('');
  const [level, setLevel] = useState('');
  const [keyword, setKeyword] = useState('');

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (service) params.append('service', service);
      if (level) params.append('level', level);
      if (keyword) params.append('keyword', keyword);

      const res = await axios.get(`http://localhost:8080/logs?${params.toString()}`, {
        headers: { Authorization: localStorage.getItem('token') || '' },
      });
      setLogs(res.data);
    } catch (err) {
      alert('Failed to fetch logs');
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div>
      <h3 className="text-xl mb-4">Logs</h3>
      <form onSubmit={handleSearch} className="mb-4 flex gap-4">
        <input
          type="text"
          value={service}
          onChange={(e) => setService(e.target.value)}
          placeholder="Service (e.g., backend)"
          className="p-2 border rounded"
        />
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Levels</option>
          <option value="info">Info</option>
          <option value="error">Error</option>
          <option value="warn">Warn</option>
        </select>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Keyword"
          className="p-2 border rounded"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Search
        </button>
      </form>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">Service</th>
            <th className="border p-2">Level</th>
            <th className="border p-2">Message</th>
            <th className="border p-2">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log._id}>
              <td className="border p-2">{log.service}</td>
              <td className="border p-2">{log.level}</td>
              <td className="border p-2">{log.message}</td>
              <td className="border p-2">{log.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogViewer;