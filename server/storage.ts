import { type Scenario, type InsertScenario, scenarios } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getScenarios(): Promise<Scenario[]>;
  getScenario(id: number): Promise<Scenario | undefined>;
  createScenario(scenario: InsertScenario): Promise<Scenario>;
  updateScenario(id: number, scenario: Partial<InsertScenario>): Promise<Scenario | undefined>;
  deleteScenario(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getScenarios(): Promise<Scenario[]> {
    return await db.select().from(scenarios);
  }

  async getScenario(id: number): Promise<Scenario | undefined> {
    const [scenario] = await db.select().from(scenarios).where(eq(scenarios.id, id));
    return scenario;
  }

  async createScenario(insertScenario: InsertScenario): Promise<Scenario> {
    const [scenario] = await db.insert(scenarios).values(insertScenario).returning();
    return scenario;
  }

  async updateScenario(id: number, update: Partial<InsertScenario>): Promise<Scenario | undefined> {
    const [updated] = await db
      .update(scenarios)
      .set(update)
      .where(eq(scenarios.id, id))
      .returning();
    return updated;
  }

  async deleteScenario(id: number): Promise<void> {
    await db.delete(scenarios).where(eq(scenarios.id, id));
  }
}

export const storage = new DatabaseStorage();
