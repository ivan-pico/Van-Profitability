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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  PiggyBank, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Save, 
  RotateCcw,
  Truck,
  Wallet,
  Info,
  Globe
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";

// --- Translations ---
const translations = {
  en: {
    title: "CamperROI",
    reset: "Reset",
    saveScenario: "Save Scenario",
    vehicleLoan: "Vehicle & Loan",
    vehiclePrice: "Vehicle Price",
    loanAmount: "Loan Amount",
    loanTerm: "Term (Months)",
    interestRate: "Interest Rate (%)",
    operatingCosts: "Operating Costs",
    annualInsurance: "Annual Insurance",
    monthlyMaintenance: "Monthly Maintenance",
    revenuePotential: "Revenue Potential",
    rentalPrice: "Rental Price / Day",
    occupancyPerMonth: "Occupancy per Month (Days)",
    globalOccupancy: "Global Occupancy (All Months)",
    totalProfit: "Total Profit",
    monthlyExpense: "Monthly Expense",
    totalRoi: "Total ROI",
    paybackPeriod: "Payback Period",
    financialProjection: "Financial Projection",
    monthlyCashflow: "Monthly Cashflow",
    cumulativeProfit: "Cumulative Profit",
    loanDetails: "Loan Details",
    monthlyPayment: "Monthly Payment",
    totalInterest: "Total Interest",
    totalCostLoan: "Total Cost of Loan",
    annualEstimates: "Annual Estimates",
    avgMonthlyRevenue: "Avg Monthly Revenue",
    avgMonthlyProfit: "Avg Monthly Profit",
    annualOccupancy: "Annual Occupancy",
    tooltips: {
      vehiclePrice: "Total purchase price of the campervan including taxes.",
      loanAmount: "The total amount borrowed from the bank or financial institution.",
      loanTerm: "The duration of the loan in months.",
      interestRate: "The annual interest rate (APR) for the loan.",
      annualInsurance: "The total cost of comprehensive insurance for one year.",
      monthlyMaintenance: "Estimated monthly costs for servicing, tires, and repairs.",
      rentalPrice: "The daily rate you charge your customers to rent the van.",
      globalOccupancy: "Set the same number of rental days for every month of the year.",
      totalProfit: "The total net earnings after all expenses and loan payments.",
      monthlyExpense: "Total fixed monthly costs (Loan + Insurance + Maintenance).",
      roi: "Return on Investment: Total profit divided by vehicle price.",
      payback: "Estimated time required to recover the initial investment."
    }
  },
  es: {
    title: "CamperROI",
    reset: "Reiniciar",
    saveScenario: "Guardar Escenario",
    vehicleLoan: "Vehículo y Préstamo",
    vehiclePrice: "Precio del Vehículo",
    loanAmount: "Importe del Préstamo",
    loanTerm: "Plazo (Meses)",
    interestRate: "Tasa de Interés (%)",
    operatingCosts: "Costes Operativos",
    annualInsurance: "Seguro Anual",
    monthlyMaintenance: "Mantenimiento Mensual",
    revenuePotential: "Potencial de Ingresos",
    rentalPrice: "Precio Alquiler / Día",
    occupancyPerMonth: "Ocupación por Mes (Días)",
    globalOccupancy: "Ocupación Global (Todos los meses)",
    totalProfit: "Beneficio Total",
    monthlyExpense: "Gasto Mensual",
    totalRoi: "ROI Total",
    paybackPeriod: "Periodo de Recuperación",
    financialProjection: "Proyección Financiera",
    monthlyCashflow: "Flujo de Caja Mensual",
    cumulativeProfit: "Beneficio Acumulado",
    loanDetails: "Detalles del Préstamo",
    monthlyPayment: "Pago Mensual",
    totalInterest: "Interés Total",
    totalCostLoan: "Coste Total del Préstamo",
    annualEstimates: "Estimaciones Anuales",
    avgMonthlyRevenue: "Ingresos Mensuales Promedio",
    avgMonthlyProfit: "Beneficio Mensual Promedio",
    annualOccupancy: "Ocupación Anual",
    tooltips: {
      vehiclePrice: "Precio total de compra de la camper incluyendo impuestos.",
      loanAmount: "La cantidad total financiada por el banco o entidad.",
      loanTerm: "La duración del préstamo en meses.",
      interestRate: "La tasa de interés anual (TAE) del préstamo.",
      annualInsurance: "El coste total del seguro a todo riesgo por un año.",
      monthlyMaintenance: "Costes mensuales estimados para revisiones, neumáticos y reparaciones.",
      rentalPrice: "La tarifa diaria que cobras a tus clientes por alquilar la furgoneta.",
      globalOccupancy: "Establece el mismo número de días de alquiler para todos los meses del año.",
      totalProfit: "Las ganancias netas totales después de todos los gastos y pagos del préstamo.",
      monthlyExpense: "Costes fisjos mensuales totales (Préstamo + Seguro + Mantenimiento).",
      roi: "Retorno de la Inversión: Beneficio total dividido por el precio del vehículo.",
      payback: "Tiempo estimado necesario para recuperar la inversión inicial."
    }
  }
};

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

const InfoIcon = ({ tooltip }: { tooltip: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help inline-block ml-1.5 opacity-60 hover:opacity-100" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[200px] text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default function Dashboard() {
  const [lang, setLang] = useState<"en" | "es">("en");
  const t = translations[lang];

  const [params, setParams] = useState(DEFAULT_SCENARIO);
  const [globalOccupancy, setGlobalOccupancy] = useState(12);
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
      const monthNamesEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthNamesEs = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      const monthName = lang === "en" ? monthNamesEn[monthIndex] : monthNamesEs[monthIndex];
      const yearSuffix = lang === "en" ? "Y" : "A";
      const year = Math.floor((i - 1) / 12) + 1;
      
      const daysRented = params.rentalDaysPerMonth[monthIndex];
      const revenue = daysRented * params.rentalPricePerDay;
      const expense = monthlyFixedExpense;
      const profit = revenue - expense;

      cumulativeProfit += profit;
      totalRevenue += revenue;
      totalExpenses += expense;

      monthlyData.push({
        month: `${monthName} ${yearSuffix}${year}`,
        monthIndex,
        income: Math.round(revenue),
        expenses: Math.round(expense),
        profit: Math.round(profit),
        cumulativeProfit: Math.round(cumulativeProfit),
      });
    }

    const totalProfit = totalRevenue - totalExpenses;
    const roi = (totalProfit / params.campervanPrice) * 100;
    
    // Payback period
    const initialInvestment = params.campervanPrice - params.loanAmount;
    const paybackMonthIndex = monthlyData.findIndex(m => m.cumulativeProfit >= initialInvestment);
    const paybackPeriod = paybackMonthIndex >= 0 
      ? `${((paybackMonthIndex + 1) / 12).toFixed(1)} ${lang === "en" ? "Years" : "Años"}` 
      : "> Term";

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
  }, [params, lang]);

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
    setGlobalOccupancy(12);
  };

  const handleGlobalOccupancyChange = (val: number) => {
    setGlobalOccupancy(val);
    setParams(p => ({
      ...p,
      rentalDaysPerMonth: Array(12).fill(val)
    }));
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
            <h1 className="text-xl font-bold font-display tracking-tight">{t.title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-muted/50 rounded-full p-1 border">
              <Button 
                variant={lang === "en" ? "secondary" : "ghost"} 
                size="sm" 
                className="rounded-full h-7 text-xs px-3"
                onClick={() => setLang("en")}
              >
                EN
              </Button>
              <Button 
                variant={lang === "es" ? "secondary" : "ghost"} 
                size="sm" 
                className="rounded-full h-7 text-xs px-3"
                onClick={() => setLang("es")}
              >
                ES
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-foreground">
              <RotateCcw className="w-4 h-4 mr-2" /> {t.reset}
            </Button>
            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30">
                  <Save className="w-4 h-4 mr-2" /> {t.saveScenario}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{lang === "en" ? "Save Profitability Scenario" : "Guardar Escenario de Rentabilidad"}</DialogTitle>
                  <DialogDescription>
                    {lang === "en" ? "Give your scenario a name to retrieve it later." : "Dale un nombre a tu escenario para recuperarlo más tarde."}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="name" className="mb-2 block">{lang === "en" ? "Scenario Name" : "Nombre del Escenario"}</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Summer Special 2025" 
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>{lang === "en" ? "Cancel" : "Cancelar"}</Button>
                  <Button onClick={handleSave} disabled={isSaving || !scenarioName}>
                    {isSaving ? (lang === "en" ? "Saving..." : "Guardando...") : (lang === "en" ? "Save Scenario" : "Guardar Escenario")}
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
                  {t.vehicleLoan}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <SliderInput
                  label={<>{t.vehiclePrice} <InfoIcon tooltip={t.tooltips.vehiclePrice} /></>}
                  value={params.campervanPrice}
                  min={10000}
                  max={150000}
                  step={1000}
                  onChange={(val) => setParams(p => ({ ...p, campervanPrice: val }))}
                />
                <SliderInput
                  label={<>{t.loanAmount} <InfoIcon tooltip={t.tooltips.loanAmount} /></>}
                  value={params.loanAmount}
                  min={0}
                  max={params.campervanPrice}
                  step={1000}
                  onChange={(val) => setParams(p => ({ ...p, loanAmount: val }))}
                />
                <div className="grid grid-cols-2 gap-4">
                  <SliderInput
                    label={<>{t.loanTerm} <InfoIcon tooltip={t.tooltips.loanTerm} /></>}
                    value={params.loanTerm}
                    min={1}
                    max={120}
                    step={1}
                    onChange={(val) => setParams(p => ({ ...p, loanTerm: val }))}
                  />
                  <SliderInput
                    label={<>{t.interestRate} <InfoIcon tooltip={t.tooltips.interestRate} /></>}
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
                   {t.operatingCosts}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <SliderInput
                  label={<>{t.annualInsurance} <InfoIcon tooltip={t.tooltips.annualInsurance} /></>}
                  value={params.annualInsurance}
                  min={0}
                  max={5000}
                  step={50}
                  onChange={(val) => setParams(p => ({ ...p, annualInsurance: val }))}
                />
                <SliderInput
                  label={<>{t.monthlyMaintenance} <InfoIcon tooltip={t.tooltips.monthlyMaintenance} /></>}
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
                   {t.revenuePotential}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <SliderInput
                  label={<>{t.rentalPrice} <InfoIcon tooltip={t.tooltips.rentalPrice} /></>}
                  value={params.rentalPricePerDay}
                  min={50}
                  max={500}
                  step={5}
                  onChange={(val) => setParams(p => ({ ...p, rentalPricePerDay: val }))}
                />
                
                <Separator />

                <SliderInput
                  label={<>{t.globalOccupancy} <InfoIcon tooltip={t.tooltips.globalOccupancy} /></>}
                  value={globalOccupancy}
                  min={0}
                  max={31}
                  step={1}
                  onChange={handleGlobalOccupancyChange}
                />
                
                <MonthSelector 
                  rentalDays={params.rentalDaysPerMonth}
                  label={<>{t.occupancyPerMonth} <InfoIcon tooltip={lang === "en" ? "Individual occupancy days for each month." : "Días de ocupación individuales para cada mes."} /></>}
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
                label={<>{t.totalProfit} <InfoIcon tooltip={t.tooltips.totalProfit} /></>}
                value={formatCurrency(calculations.totalProfit)}
                subtext={`${lang === "en" ? "Over" : "En"} ${params.loanTerm} ${lang === "en" ? "months" : "meses"}`}
                trend={calculations.totalProfit > 0 ? "up" : "down"}
                icon={<TrendingUp className="w-5 h-5" />}
                delay={0}
              />
              <MetricCard 
                label={<>{t.monthlyExpense} <InfoIcon tooltip={t.tooltips.monthlyExpense} /></>}
                value={formatCurrency(calculations.monthlyFixedExpense)}
                subtext={lang === "en" ? "Loan + Ins + Maint" : "Pmo + Seg + Mant"}
                trend="neutral"
                icon={<DollarSign className="w-5 h-5" />}
                delay={1}
              />
              <MetricCard 
                label={<>{t.totalRoi} <InfoIcon tooltip={t.tooltips.roi} /></>}
                value={`${calculations.roi.toFixed(1)}%`}
                subtext={lang === "en" ? "Return on Investment" : "Retorno Inversión"}
                trend={calculations.roi > 0 ? "up" : "down"}
                icon={<PiggyBank className="w-5 h-5" />}
                delay={2}
              />
              <MetricCard 
                label={<>{t.paybackPeriod} <InfoIcon tooltip={t.tooltips.payback} /></>}
                value={calculations.paybackPeriod}
                subtext={lang === "en" ? "Time to break even" : "Tiempo recuperación"}
                trend="neutral"
                icon={<Calendar className="w-5 h-5" />}
                delay={3}
              />
            </div>

            {/* Charts Section */}
            <Card className="border-border/50 shadow-md overflow-hidden bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <CardTitle>{t.financialProjection}</CardTitle>
                  <Tabs defaultValue="monthly" className="w-full sm:w-[400px]">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="monthly">{t.monthlyCashflow}</TabsTrigger>
                      <TabsTrigger value="cumulative">{t.cumulativeProfit}</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="h-[400px] pt-0">
                <Tabs defaultValue="monthly" className="h-full">
                  <TabsContent value="monthly" className="h-full mt-0">
                    <ProfitChart data={calculations.monthlyData} type="monthly" />
                  </TabsContent>
                  <TabsContent value="cumulative" className="h-full mt-0">
                    <ProfitChart data={calculations.monthlyData} type="cumulative" />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Breakdown */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card>
                 <CardHeader>
                   <CardTitle>{t.loanDetails}</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-4">
                     <div className="flex justify-between items-center py-2 border-b">
                       <span className="text-muted-foreground">{t.monthlyPayment}</span>
                       <span className="font-bold">{formatCurrency(calculations.monthlyLoanPayment)}</span>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b">
                       <span className="text-muted-foreground">{t.totalInterest}</span>
                       <span className="font-bold">{formatCurrency((calculations.monthlyLoanPayment * params.loanTerm) - params.loanAmount)}</span>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b">
                       <span className="text-muted-foreground">{t.totalCostLoan}</span>
                       <span className="font-bold">{formatCurrency(calculations.monthlyLoanPayment * params.loanTerm)}</span>
                     </div>
                   </div>
                 </CardContent>
               </Card>

               <Card>
                 <CardHeader>
                   <CardTitle>{t.annualEstimates}</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="space-y-4">
                     <div className="flex justify-between items-center py-2 border-b">
                       <span className="text-muted-foreground">{t.avgMonthlyRevenue}</span>
                       <span className="font-bold text-green-600">{formatCurrency(calculations.totalRevenue / params.loanTerm)}</span>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b">
                       <span className="text-muted-foreground">{t.avgMonthlyProfit}</span>
                       <span className="font-bold">{formatCurrency(calculations.totalProfit / params.loanTerm)}</span>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b">
                       <span className="text-muted-foreground">{t.annualOccupancy}</span>
                       <span className="font-bold">
                         {Math.round((params.rentalDaysPerMonth.reduce((a, b) => a + b, 0) / (30.4 * 12)) * 100)}%
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
