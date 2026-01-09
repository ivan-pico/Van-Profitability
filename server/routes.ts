import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertScenarioSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.scenarios.list.path, async (req, res) => {
    const scenarios = await storage.getScenarios();
    res.json(scenarios);
  });

  app.get(api.scenarios.get.path, async (req, res) => {
    const scenario = await storage.getScenario(Number(req.params.id));
    if (!scenario) {
      return res.status(404).json({ message: "Scenario not found" });
    }
    res.json(scenario);
  });

  app.post(api.scenarios.create.path, async (req, res) => {
    try {
      const input = api.scenarios.create.input.parse(req.body);
      const scenario = await storage.createScenario(input);
      res.status(201).json(scenario);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.scenarios.update.path, async (req, res) => {
    try {
      const input = api.scenarios.update.input.parse(req.body);
      const scenario = await storage.updateScenario(Number(req.params.id), input);
      if (!scenario) {
        return res.status(404).json({ message: "Scenario not found" });
      }
      res.json(scenario);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.scenarios.delete.path, async (req, res) => {
    await storage.deleteScenario(Number(req.params.id));
    res.status(204).send();
  });

  // Seed default scenario if none exists
  const existingScenarios = await storage.getScenarios();
  if (existingScenarios.length === 0) {
    await storage.createScenario({
      name: "Default Campervan Scenario",
      campervanPrice: 60000,
      loanAmount: 60000,
      loanTerm: 60,
      interestRate: "5",
      annualInsurance: 900,
      monthlyMaintenance: 60,
      rentalPricePerDay: 120,
      rentalDaysPerMonth: [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12]
    });
  }

  return httpServer;
}
