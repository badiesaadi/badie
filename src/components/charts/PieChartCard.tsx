import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '../ui/Card';
import { ChartDataPoint } from '../../types';

interface PieChartCardProps {
  title: string;
  data: ChartDataPoint[];
  dataKey: string;
  nameKey: string;
  colors: string[];
  className?: string;
}

export const PieChartCard: React.FC<PieChartCardProps> = ({
  title,
  data,
  dataKey,
  nameKey,
  colors,
  className = '',
}) => {
  return (
    <Card title={title} className={className}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey={dataKey}
              nameKey={nameKey}
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
              labelStyle={{ color: '#333' }}
              itemStyle={{ color: '#333' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
