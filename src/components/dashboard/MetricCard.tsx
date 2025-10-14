import { Card } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, TrendingUp } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  suffix?: string;
}

export const MetricCard = ({ title, value, change, icon, trend = "neutral", suffix }: MetricCardProps) => {
  const getTrendColor = () => {
    if (trend === "up") return "text-accent";
    if (trend === "down") return "text-destructive";
    return "text-muted-foreground";
  };

  return (
    <Card className="p-6 card-gradient border-border/50 hover:border-primary/50 transition-smooth">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-foreground">
              {value}
            </h3>
            {suffix && <span className="text-lg text-muted-foreground">{suffix}</span>}
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}>
              {trend === "up" && <ArrowUpIcon className="h-4 w-4" />}
              {trend === "down" && <ArrowDownIcon className="h-4 w-4" />}
              {trend === "neutral" && <TrendingUp className="h-4 w-4" />}
              <span>{change > 0 ? "+" : ""}{change}%</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </Card>
  );
};