import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MetricCardProps {
  label: React.ReactNode;
  value: string | number;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  className?: string;
  delay?: number;
}

export function MetricCard({ label, value, subtext, trend, icon, className, delay = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1, ease: "easeOut" }}
      className={cn(
        "bg-card text-card-foreground p-6 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow",
        className
      )}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm font-medium text-muted-foreground flex items-center">{label}</div>
          <h3 className="text-2xl font-bold mt-2 tracking-tight">{value}</h3>
          {subtext && (
            <p className={cn("text-xs mt-1 font-medium", {
              "text-green-600": trend === "up",
              "text-red-600": trend === "down",
              "text-muted-foreground": !trend || trend === "neutral"
            })}>
              {subtext}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}
