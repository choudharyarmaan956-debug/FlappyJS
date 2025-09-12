import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  score: integer("score").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
}).extend({
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number"),
  username: z.string()
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username must be no more than 30 characters long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  displayName: z.string()
    .min(1, "Display name is required")
    .max(50, "Display name must be no more than 50 characters long")
    .trim()
});

export const insertScoreSchema = createInsertSchema(scores).pick({
  userId: true,
  score: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertScore = z.infer<typeof insertScoreSchema>;
export type Score = typeof scores.$inferSelect;
