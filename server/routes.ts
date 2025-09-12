import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertScoreSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { authenticateJWT, generateJWT } from "./auth";
import cookieParser from "cookie-parser";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add cookie parser middleware
  app.use(cookieParser());

  // User registration endpoint
  app.post("/api/register", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: "Invalid user data", 
          details: fromZodError(result.error).toString() 
        });
      }

      const { displayName } = result.data;
      
      // Check if user already exists
      const existingUser = await storage.getUserByName(displayName);
      if (existingUser) {
        return res.status(409).json({ error: "Name already exists" });
      }

      // Create new user
      const user = await storage.createUser({ displayName });
      
      // Generate JWT token
      const token = generateJWT(user);
      
      // Set secure HTTP-only cookie
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      res.status(201).json({ user });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  // User login endpoint - simplified name-only
  app.post("/api/login", async (req, res) => {
    try {
      const { displayName } = req.body;
      
      if (!displayName) {
        return res.status(400).json({ error: "Name is required" });
      }

      // Find or create user by name
      let user = await storage.getUserByName(displayName);
      if (!user) {
        user = await storage.createUser({ displayName });
      }

      // Generate JWT token
      const token = generateJWT(user);
      
      // Set secure HTTP-only cookie
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({ user });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  // Submit score endpoint - protected by authentication
  app.post("/api/scores", authenticateJWT, async (req, res) => {
    try {
      // Only validate the score, not userId (we get that from JWT)
      const scoreResult = insertScoreSchema.pick({ score: true }).safeParse(req.body);
      if (!scoreResult.success) {
        return res.status(400).json({ 
          error: "Invalid score data", 
          details: fromZodError(scoreResult.error).toString() 
        });
      }

      const { score } = scoreResult.data;
      
      // Get userId from authenticated user (from JWT token)
      const userId = req.user!.id;
      
      // Add score using authenticated user's ID
      const newScore = await storage.addScore({ userId, score });
      res.status(201).json({ score: newScore });
    } catch (error) {
      console.error("Score submission error:", error);
      res.status(500).json({ error: "Failed to submit score" });
    }
  });

  // Get authenticated user's scores endpoint
  app.get("/api/users/:userId/scores", authenticateJWT, async (req, res) => {
    try {
      const requestedUserId = parseInt(req.params.userId);
      if (isNaN(requestedUserId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      // Users can only access their own scores
      if (requestedUserId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied - can only view your own scores" });
      }

      const scores = await storage.getUserScores(requestedUserId);
      res.json({ scores });
    } catch (error) {
      console.error("Get user scores error:", error);
      res.status(500).json({ error: "Failed to get user scores" });
    }
  });

  // Get current user's scores endpoint (alternative route)
  app.get("/api/my-scores", authenticateJWT, async (req, res) => {
    try {
      const userId = req.user!.id;
      const scores = await storage.getUserScores(userId);
      res.json({ scores });
    } catch (error) {
      console.error("Get user scores error:", error);
      res.status(500).json({ error: "Failed to get user scores" });
    }
  });

  // Get leaderboard endpoint
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topScores = await storage.getTopScores(limit);
      res.json({ leaderboard: topScores });
    } catch (error) {
      console.error("Leaderboard error:", error);
      res.status(500).json({ error: "Failed to get leaderboard" });
    }
  });

  // Get user profile endpoint - only allow viewing own profile
  app.get("/api/users/:userId", authenticateJWT, async (req, res) => {
    try {
      const requestedUserId = parseInt(req.params.userId);
      if (isNaN(requestedUserId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      // Users can only access their own profile
      if (requestedUserId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied - can only view your own profile" });
      }

      const user = await storage.getUser(requestedUserId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ user });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Get current user profile endpoint (alternative route)
  app.get("/api/me", authenticateJWT, async (req, res) => {
    try {
      const user = req.user!;
      
      res.json({ user });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Logout endpoint - clears authentication cookie
  app.post("/api/logout", (req, res) => {
    try {
      // Clear the authentication cookie
      res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Failed to logout" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
