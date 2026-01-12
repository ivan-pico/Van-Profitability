import { pgTable, text, serial, integer, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const scenarios = pgTable("scenarios", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  campervanPrice: integer("campervan_price").notNull(),
  loanAmount: integer("loan_amount").notNull(),
  loanTerm: integer("loan_term").notNull(),
  interestRate: numeric("interest_rate").notNull(),
  annualInsurance: integer("annual_insurance").notNull(),
  monthlyMaintenance: integer("monthly_maintenance").notNull(),
  rentalPricePerDay: integer("rental_price_per_day").notNull(),
  rentalDaysPerMonth: jsonb("rental_days_per_month").$type<number[]>().notNull(), // Array of 12 numbers
  customCosts: jsonb("custom_costs").$type<{name: string, value: number, period: 'monthly' | 'annual'}[]>().default([]).notNull(),
  notes: text("notes"),
});

export const insertScenarioSchema = createInsertSchema(scenarios).omit({ id: true });

export type Scenario = typeof scenarios.$inferSelect;
export type InsertScenario = z.infer<typeof insertScenarioSchema>;
