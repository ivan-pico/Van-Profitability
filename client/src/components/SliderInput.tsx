import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import React from "react";

interface SliderInputProps {
  label: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
  className?: string;
}

export function SliderInput({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
  className
}: SliderInputProps) {
  
  const handleSliderChange = (vals: number[]) => {
    onChange(vals[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onChange(val);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium text-foreground/80 flex items-center">{label}</Label>
        <div className="flex items-center gap-1 bg-background border rounded-md px-2 py-1 w-24 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <Input 
            type="number" 
            value={value} 
            onChange={handleInputChange}
            className="h-6 p-0 border-0 shadow-none focus-visible:ring-0 text-right font-mono text-sm"
          />
          {unit && <span className="text-xs text-muted-foreground select-none">{unit}</span>}
        </div>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={handleSliderChange}
        className="cursor-pointer"
      />
    </div>
  );
}
