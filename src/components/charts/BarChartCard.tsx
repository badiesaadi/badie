import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '../ui/Card';
import { ChartDataPoint } from '../../types';

interface BarChartCardProps {
  title: string;
  data: ChartDataPoint[];
  dataKey: string;
  fillColor?: string;
  className?: string;
}

export const BarChartCard: React.FC<BarChartCardProps> = ({
  title,
  data,
  dataKey,
  fillColor = '#3b82f6', // primary blue
  className = '',
}) => {
  return (
    <Card title={title} className={className}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
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
            <Bar dataKey={dataKey} fill={fillColor} name={title} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
