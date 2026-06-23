'use client'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts'

const COLORS = { completed: '#22c55e', inProgress: '#3b82f6', notStarted: '#94a3b8', overdue: '#ef4444' }

interface ComplianceDonutProps {
  data: { name: string; value: number; color: string }[]
  centerLabel?: string
}

export function ComplianceDonut({ data, centerLabel }: ComplianceDonutProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={2} dataKey="value">
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(val) => [`${val}`, '']} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function ComplianceTrend({ data }: { data: { month: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
        <Tooltip formatter={v => [`${v}%`, 'Compliance']} />
        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function DepartmentBar({ data }: { data: { name: string; percentage: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" horizontal={false} className="opacity-30" />
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
        <Tooltip formatter={v => [`${v}%`, 'Progress']} />
        <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.percentage >= 75 ? '#22c55e' : entry.percentage >= 50 ? '#f59e0b' : '#ef4444'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
