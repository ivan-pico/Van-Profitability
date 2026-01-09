import { useState, useMemo, useEffect } from "react";
import { useCreateScenario, useScenarios } from "@/hooks/use-scenarios";
import { SliderInput } from "@/components/SliderInput";
import { MonthSelector } from "@/components/MonthSelector";
import { MetricCard } from "@/components/MetricCard";
import { ProfitChart } from "@/components/ProfitChart";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  PiggyBank, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Save, 
  RotateCcw,
  Truck,
  Wallet
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";

// Default Scenario
const DEFAULT_SCENARIO = {
  campervanPrice: 60000,
  loanAmount: 60000,
  loanTerm: 60,
  interestRate: 5,
  annualInsurance: 900,
  monthlyMaintenance: 60,
  rentalPricePerDay: 120,
  rentalDaysPerMonth: Array(12).fill(12),
};

export default function Dashboard() {
  const [params, setParams] = useState(DEFAULT_SCENARIO);
  const [scenarioName, setScenarioName] = useState("");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  
  const { mutate: createScenario, isPending: isSaving } = useCreateScenario();
  
  // -- Calculations --
  const calculations = useMemo(() => {
    const monthlyRate = params.interestRate / 100 / 12;
    const n = params.loanTerm;
    
    // Monthly Loan Payment Formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1 ]
    // If interest is 0, just divide
    let monthlyLoanPayment = 0;
    if (params.interestRate === 0) {
      monthlyLoanPayment = params.loanAmount / params.loanTerm;
    } else {
      monthlyLoanPayment = params.loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    }

    const monthlyInsurance = params.annualInsurance / 12;
    const monthlyFixedExpense = monthlyLoanPayment + monthlyInsurance + params.monthlyMaintenance;

    let cumulativeProfit = 0;
    const monthlyData = [];
    let totalRevenue = 0;
    let totalExpenses = 0;

    // We simulate for the full loan term duration
    // Loop through months 1 to loanTerm
    for (let i = 1; i <= params.loanTerm; i++) {
      const monthIndex = (i - 1) % 12; // 0-11 for Jan-Dec
      const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][monthIndex];
      const year = Math.floor((i - 1) / 12) + 1;
      
      const daysRented = params.rentalDaysPerMonth[monthIndex];
      const revenue = daysRented * params.rentalPricePerDay;
      const expense = monthlyFixedExpense;
      const profit = revenue - expense;

      cumulativeProfit += profit;
      totalRevenue += revenue;
      totalExpenses += expense;

      monthlyData.push({
        month: `${monthName} Y${year}`,
        monthIndex,
        income: Math.round(revenue),
        expenses: Math.round(expense),
        profit: Math.round(profit),
        cumulativeProfit: Math.round(cumulativeProfit),
      });
    }

    const totalProfit = totalRevenue - totalExpenses;
    const roi = (totalProfit / params.campervanPrice) * 100;
    
    // Payback period: Find first month where cumulativeProfit > 0 (assuming initial down payment is price - loan)
    // Here we assume 100% financed based on inputs, so equity starts at 0 or negative if we consider down payment
    // If Loan Amount < Price, the difference is the initial investment.
    const initialInvestment = params.campervanPrice - params.loanAmount;
    const paybackMonthIndex = monthlyData.findIndex(m => m.cumulativeProfit >= initialInvestment);
    const paybackPeriod = paybackMonthIndex >= 0 ? `${(paybackMonthIndex + 1) / 12} Years` : "> Term";

    return {
      monthlyLoanPayment,
      monthlyData,
      totalProfit,
      totalRevenue,
      totalExpenses,
      roi,
      paybackPeriod,
      monthlyFixedExpense
    };
  }, [params]);

  const handleSave = () => {
    createScenario({
      name: scenarioName || `Scenario ${new Date().toLocaleString()}`,
      ...params,
      interestRate: params.interestRate.toString(), // Schema expects numeric string
    }, {
      onSuccess: () => {
        setIsSaveDialogOpen(false);
        setScenarioName("");
      }
    });
  };

  const handleReset = () => {
    setParams(DEFAULT_SCENARIO);
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground pb-20">
      
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Truck className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold font-display tracking-tight">CamperROI</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-foreground">
              <RotateCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30">
                  <Save className="w-4 h-4 mr-2" /> Save Scenario
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Profitability Scenario</DialogTitle>
                  <DialogDescription>
                    Give your scenario a name to retrieve it later.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="name" className="mb-2 block">Scenario Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Summer Special 2025" 
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={isSaving || !scenarioName}>
                    {isSaving ? "Saving..." : "Save Scenario"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-4 space-y-6"
          >
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  Vehicle & Loan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <SliderInput
                  label="Vehicle Price (€)"
                  value={params.campervanPrice}
                  min={10000}
                  max={150000}
                  step={1000}
                  onChange={(val) => setParams(p => ({ ...p, campervanPrice: val }))}
                />
                <SliderInput
                  label="Loan Amount (€)"
                  value={params.loanAmount}
                  min={0}
                  max={params.campervanPrice}
                  step={1000}
                  onChange={(val) => setParams(p => ({ ...p, loanAmount: val }))}
                />
                <div className="grid grid-cols-2 gap-4">
                  <SliderInput
                    label="Term (Months)"
                    value={params.loanTerm}
                    min={12}
                    max={120}
                    step={12}
                    onChange={(val) => setParams(p => ({ ...p, loanTerm: val }))}
                  />
                  <SliderInput
                    label="Interest Rate (%)"
                    value={params.interestRate}
                    min={0}
                    max={15}
                    step={0.1}
                    unit="%"
                    onChange={(val) => setParams(p => ({ ...p, interestRate: val }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
               <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                   <PiggyBank className="w-5 h-5 text-accent" />
                   Operating Costs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <SliderInput
                  label="Annual Insurance (€)"
                  value={params.annualInsurance}
                  min={0}
                  max={5000}
                  step={50}
                  onChange={(val) => setParams(p => ({ ...p, annualInsurance: val }))}
                />
                <SliderInput
                  label="Monthly Maintenance (€)"
                  value={params.monthlyMaintenance}
                  min={0}
                  max={500}
                  step={10}
                  onChange={(val) => setParams(p => ({ ...p, monthlyMaintenance: val }))}
                />
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                   <DollarSign className="w-5 h-5 text-green-500" />
                   Revenue Potential
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <SliderInput
                  label="Rental Price / Day (€)"
                  value={params.rentalPricePerDay}
                  min={50}
                  max={500}
                  step={5}
                  onChange={(val) => setParams(p => ({ ...p, rentalPricePerDay: val }))}
                />
                
                <Separator />
                
                <MonthSelector 
                  rentalDays={params.rentalDaysPerMonth}
                  onChange={(days) => setParams(p => ({ ...p, rentalDaysPerMonth: days }))}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Dashboard Area */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard 
                label="Total Profit" 
                value={formatCurrency(calculations.totalProfit)}
                subtext={`Over ${params.loanTerm} months`}
                trend={calculations.totalProfit > 0 ? "up" : "down"}
                icon={<TrendingUp className="w-5 h-5" />}
                delay={0}
              />
              <MetricCard 
                label="Monthly Expense" 
                value={formatCurrency(calculations.monthlyFixedExpense)}
                subtext="Loan + Ins + Maint"
                trend="neutral"
                icon={<DollarSign className="w-5 h-5" />}
                delay={1}
              />
              <MetricCard 
                label="Total ROI" 
                value={`${calculations.roi.toFixed(1)}%`}
                subtext="Return on Investment"
                trend={calculations.roi > 0 ? "up" : "down"}
                icon={<PiggyBank className="w-5 h-5" />}
                delay={2}
              />
              <MetricCard 
                label="Payback Period" 
                value={calculations.paybackPeriod}
                subtext="Time to break even"
                trend="neutral"
                icon={<Calendar className="w-5 h-5" />}
                delay={3}
              />
            </div>

            {/* Charts Section */}
            <Card className="border-border/50 shadow-md overflow-hidden bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Financial Projection</CardTitle>
                  <Tabs defaultValue="monthly" className="w-[400px]">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="monthly">Monthly Cashflow</TabsTrigger>
                      <TabsTrigger value="cumulative">Cumulative Profit</TabsTrigger>
                    </TabsList>
                    
                    <div className="mt-6 h-[400px]">
                      <TabsContent value="monthly" className="h-full mt-0">
                        <ProfitChart data={calculations.monthlyData} type="monthly" />
                      </TabsContent>
                      <TabsContent value="cumulative" className="h-full mt-0">
                         <ProfitChart data={calculations.monthlyData} type="cumulative" />
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </CardHeader>
            </Card>

            {/* Breakdown */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card>
                 <CardHeader>
                   <CardTitle>Loan Details</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-4">
                     <div className="flex justify-between items-center py-2 border-b">
                       <span className="text-muted-foreground">Monthly Payment</span>
                       <span className="font-bold">{formatCurrency(calculations.monthlyLoanPayment)}</span>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b">
                       <span className="text-muted-foreground">Total Interest</span>
                       <span className="font-bold">{formatCurrency((calculations.monthlyLoanPayment * params.loanTerm) - params.loanAmount)}</span>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b">
                       <span className="text-muted-foreground">Total Cost of Loan</span>
                       <span className="font-bold">{formatCurrency(calculations.monthlyLoanPayment * params.loanTerm)}</span>
                     </div>
                   </div>
                 </CardContent>
               </Card>

               <Card>
                 <CardHeader>
                   <CardTitle>Annual Estimates</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="space-y-4">
                     <div className="flex justify-between items-center py-2 border-b">
                       <span className="text-muted-foreground">Avg Monthly Revenue</span>
                       <span className="font-bold text-green-600">{formatCurrency(calculations.totalRevenue / params.loanTerm)}</span>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b">
                       <span className="text-muted-foreground">Avg Monthly Profit</span>
                       <span className="font-bold">{formatCurrency(calculations.totalProfit / params.loanTerm)}</span>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b">
                       <span className="text-muted-foreground">Annual Occupancy</span>
                       <span className="font-bold">
                         {Math.round((params.rentalDaysPerMonth.reduce((a, b) => a + b, 0) / 365) * 100)}%
                       </span>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             </div>

          </div>
        </div>
      </main>
    </div>
  );
}
