import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface PerformanceData {
  month: number;
  year: number;
  total_beneficiaries: number;
  person_days_generated: number;
  payment_completion_percentage: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const PerformanceChart = ({ data }: PerformanceChartProps) => {
  const chartData = [...data].reverse().map((item) => ({
    name: `${monthNames[item.month - 1]} ${item.year}`,
    beneficiaries: item.total_beneficiaries,
    personDays: item.person_days_generated,
    completion: item.payment_completion_percentage,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="name" 
          stroke="hsl(var(--foreground))"
          tick={{ fill: "hsl(var(--foreground))" }}
        />
        <YAxis 
          stroke="hsl(var(--foreground))"
          tick={{ fill: "hsl(var(--foreground))" }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="beneficiaries" 
          stroke="hsl(var(--primary))" 
          strokeWidth={3}
          name="लाभार्थी / Beneficiaries"
          dot={{ fill: "hsl(var(--primary))", r: 5 }}
        />
        <Line 
          type="monotone" 
          dataKey="personDays" 
          stroke="hsl(var(--success))" 
          strokeWidth={3}
          name="व्यक्ति-दिवस / Person-Days"
          dot={{ fill: "hsl(var(--success))", r: 5 }}
        />
        <Line 
          type="monotone" 
          dataKey="completion" 
          stroke="hsl(var(--accent))" 
          strokeWidth={3}
          name="पूर्णता % / Completion %"
          dot={{ fill: "hsl(var(--accent))", r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PerformanceChart;
