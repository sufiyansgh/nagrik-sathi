import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  subtitle: string;
  value: string;
  icon: ReactNode;
  color: "primary" | "success" | "accent" | "info" | "destructive";
}

const MetricCard = ({ title, subtitle, value, icon, color }: MetricCardProps) => {
  const colorClasses = {
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-success/10 text-success border-success/20",
    accent: "bg-accent/10 text-accent border-accent/20",
    info: "bg-info/10 text-info border-info/20",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <Card className={`p-6 border-2 ${colorClasses[color]} bg-card`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>
      <p className={`text-3xl font-bold ${color === "primary" ? "text-primary" : color === "success" ? "text-success" : color === "accent" ? "text-accent" : color === "info" ? "text-info" : "text-destructive"}`}>
        {value}
      </p>
    </Card>
  );
};

export default MetricCard;
