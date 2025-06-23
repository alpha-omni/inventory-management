'use client'

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface LineChartProps {
  data: Array<Record<string, string | number | Date>>
  lines: Array<{
    dataKey: string
    stroke: string
    name: string
  }>
  xAxisDataKey: string
  height?: number
}

export default function LineChart({ data, lines, xAxisDataKey, height = 300 }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey={xAxisDataKey} 
          stroke="#9CA3AF"
          fontSize={12}
        />
        <YAxis 
          stroke="#9CA3AF"
          fontSize={12}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#F9FAFB'
          }}
        />
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.stroke}
            strokeWidth={2}
            dot={{ fill: line.stroke, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: line.stroke }}
            name={line.name}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
} 