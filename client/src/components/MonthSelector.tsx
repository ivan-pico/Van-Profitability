import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MonthSelectorProps {
  rentalDays: number[];
  label: React.ReactNode;
  onChange: (newDays: number[]) => void;
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function MonthSelector({ rentalDays, label, onChange }: MonthSelectorProps) {

  const updateMonth = (index: number, val: number) => {
    const newDays = [...rentalDays];
    newDays[index] = Math.min(31, Math.max(0, val));
    onChange(newDays);
  };

  return (
    <div className="bg-card/50 rounded-xl p-4 border border-border/50">
      <div className="flex justify-between items-center mb-4">
        <Label className="font-semibold text-foreground flex items-center">{label}</Label>
        <span className="text-xs text-muted-foreground italic">Drag bars</span>
      </div>
      
      <div className="grid grid-cols-12 gap-2 h-32 items-end">
        {rentalDays.map((days, i) => (
          <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group relative">
            <div className="w-full relative h-full flex items-end bg-muted/30 rounded-t-sm overflow-hidden">
               {/* Interactive "Bar" */}
               <motion.div 
                 initial={{ height: 0 }}
                 animate={{ height: `${(days / 31) * 100}%` }}
                 className={cn(
                   "w-full bg-primary/80 hover:bg-primary transition-colors cursor-ns-resize rounded-t-sm absolute bottom-0",
                   days > 20 ? "bg-primary" : days > 10 ? "bg-primary/70" : "bg-primary/40"
                 )}
               />
               
               {/* Invisible Input Overlay for simple control */}
               <input 
                 type="range"
                 min={0}
                 max={31}
                 value={days}
                 onChange={(e) => updateMonth(i, parseInt(e.target.value))}
                 className="absolute inset-0 opacity-0 cursor-ns-resize z-10 w-full h-full appearance-none"
                 style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} 
                 // Note: Rotate hack is tricky, better to just rely on range input semantics vertically if supported or just simple click logic
               />
               <input
                  type="range"
                  min="0"
                  max="31"
                  className="absolute bottom-0 left-0 w-full h-full opacity-0 cursor-pointer z-20"
                  // Use vertical orientation for webkit
                  style={{ writingMode: 'vertical-lr', direction: 'rtl' } as any} 
                  value={days}
                  onChange={(e) => updateMonth(i, parseInt(e.target.value))}
               />
            </div>
            
            <div className="text-center">
              <span className="text-[10px] font-bold block mb-0.5">{days}</span>
              <span className="text-[10px] text-muted-foreground uppercase">{months[i]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
