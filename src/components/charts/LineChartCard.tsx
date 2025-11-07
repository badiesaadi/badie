import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '../ui/Card';
import { ChartDataPoint } from '../../types';

interface LineChartCardProps {
  title: string;
  data: ChartDataPoint[];
  dataKey: string; // The key for the value in ChartDataPoint
  strokeColor?: string;
  className?: string;
}

export const LineChartCard: React.FC<LineChartCardProps> = ({
  title,
  data,
  dataKey,
  strokeColor = '#3b82f6', // primary blue
  className = '',
}) => {
  return (
    <Card title={title} className={className}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: 10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
              labelStyle={{ color: '#333' }}
              itemStyle={{ color: '#333' }}
            />
            <Legend />
            <Line type="monotone" dataKey={dataKey} stroke={strokeColor} activeDot={{ r: 8 }} name={title} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
