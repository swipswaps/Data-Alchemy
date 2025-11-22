import React from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { AIInsight, ChartType, DataRow } from '../types';

interface VisualizerProps {
  insight: AIInsight;
  data: DataRow[];
}

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export const Visualizer: React.FC<VisualizerProps> = ({ insight, data }) => {
  const { type, xAxisKey, dataKeys, title } = insight.suggestedChart;
  
  if (type === ChartType.NONE) return null;

  // Prepare data (limit to top 30 for readability)
  const chartData = data.slice(0, 30);

  const renderChart = () => {
    switch (type) {
      case ChartType.BAR:
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey={xAxisKey} tick={{fontSize: 12}} stroke="#94a3b8" />
            <YAxis tick={{fontSize: 12}} stroke="#94a3b8" />
            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
            <Legend />
            {dataKeys.map((key, index) => (
              <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        );
      case ChartType.LINE:
        return (
          <LineChart data={chartData}>
             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey={xAxisKey} tick={{fontSize: 12}} stroke="#94a3b8" />
            <YAxis tick={{fontSize: 12}} stroke="#94a3b8" />
            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
            <Legend />
            {dataKeys.map((key, index) => (
              <Line type="monotone" key={key} dataKey={key} stroke={COLORS[index % COLORS.length]} strokeWidth={3} dot={false} activeDot={{r: 6}} />
            ))}
          </LineChart>
        );
      case ChartType.AREA:
        return (
          <AreaChart data={chartData}>
             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey={xAxisKey} tick={{fontSize: 12}} stroke="#94a3b8" />
            <YAxis tick={{fontSize: 12}} stroke="#94a3b8" />
            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
            <Legend />
            {dataKeys.map((key, index) => (
              <Area type="monotone" key={key} dataKey={key} stroke={COLORS[index % COLORS.length]} fill={COLORS[index % COLORS.length]} fillOpacity={0.2} />
            ))}
          </AreaChart>
        );
      case ChartType.PIE:
        return (
          <PieChart>
            <Pie
              data={chartData.slice(0, 10)} // Limit pie slices
              dataKey={dataKeys[0]}
              nameKey={xAxisKey}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {chartData.slice(0, 10).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-[500px]">
      <div className="mb-6">
         <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
         <p className="text-sm text-gray-500">Auto-generated based on sheet contents</p>
      </div>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart() || <div>Unable to render chart</div>}
        </ResponsiveContainer>
      </div>
    </div>
  );
};