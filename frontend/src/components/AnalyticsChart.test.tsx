import { render, screen } from '@testing-library/react';
import AnalyticsChart from './AnalyticsChart';

test('renders analytics chart', () => {
  render(<AnalyticsChart />);
  expect(screen.getByText(/error log analytics/i)).toBeInTheDocument();
});