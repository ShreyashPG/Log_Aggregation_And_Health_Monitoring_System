// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import LogViewer from '../components/LogViewer';
// import MetricsChart from '../components/MetricsChart';

// interface DashboardProps {
//   token: string | null;
// }

// const Dashboard: React.FC<DashboardProps> = ({ token }) => {
//   const navigate = useNavigate();

//   if (!token) {
//     navigate('/login');
//     return null;
//   }

//   return (
//     <div className="p-6">
//       <h1 className="text-3xl mb-6">Log Aggregation Dashboard</h1>
//       <LogViewer token={token} />
//       <MetricsChart token={token} />
//     </div>
//   );
// };

// export default Dashboard; 

import React from 'react';
import LogViewer from '../components/LogViewer';
import MetricsDashboard from '../components/MetricsDashboard';
import AnalyticsChart from '../components/AnalyticsChart';

const Dashboard: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl mb-6">Log Aggregation & Monitoring</h1>
      <LogViewer />
      <MetricsDashboard />
      <AnalyticsChart />
    </div>
  );
};

export default Dashboard;