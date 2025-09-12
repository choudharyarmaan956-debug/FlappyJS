import { users, type User, type InsertUser, type Score, type InsertScore } from "@shared/schema";
import bcrypt from "bcrypt";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyPassword(username: string, password: string): Promise<User | undefined>;
  addScore(score: InsertScore): Promise<Score>;
  getUserScores(userId: number): Promise<Score[]>;
  getTopScores(limit?: number): Promise<(Score & { user: User })[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private scores: Map<number, Score>;
  currentId: number;
  currentScoreId: number;

  constructor() {
    this.users = new Map();
    this.scores = new Map();
    this.currentId = 1;
    this.currentScoreId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(insertUser.password, saltRounds);
    const id = this.currentId++;
    const user: User = { ...insertUser, password: hashedPassword, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async verifyPassword(username: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByUsername(username);
    if (!user) return undefined;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : undefined;
  }

  async addScore(insertScore: InsertScore): Promise<Score> {
    const id = this.currentScoreId++;
    const score: Score = { ...insertScore, id, createdAt: new Date() };
    this.scores.set(id, score);
    return score;
  }

  async getUserScores(userId: number): Promise<Score[]> {
    return Array.from(this.scores.values())
      .filter(score => score.userId === userId)
      .sort((a, b) => b.score - a.score); // Sort by score descending
  }

  async getTopScores(limit: number = 10): Promise<(Score & { user: User })[]> {
    const allScores = Array.from(this.scores.values())
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, limit);
    
    const scoresWithUsers: (Score & { user: User })[] = [];
    for (const score of allScores) {
      const user = await this.getUser(score.userId);
      if (user) {
        scoresWithUsers.push({ ...score, user });
      }
    }
    
    return scoresWithUsers;
  }
}

import { createClient } from '@supabase/supabase-js';

// Supabase Storage Implementation
export class SupabaseStorage implements IStorage {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found in environment variables');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    const userWithHashedPassword = { ...user, password: hashedPassword };
    
    const { data, error } = await this.supabase
      .from('users')
      .insert(userWithHashedPassword)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return data as User;
  }

  async verifyPassword(username: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByUsername(username);
    if (!user) return undefined;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : undefined;
  }

  async addScore(score: InsertScore): Promise<Score> {
    const { data, error } = await this.supabase
      .from('scores')
      .insert(score)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to add score: ${error.message}`);
    return data as Score;
  }

  async getUserScores(userId: number): Promise<Score[]> {
    const { data, error } = await this.supabase
      .from('scores')
      .select('*')
      .eq('userId', userId)
      .order('score', { ascending: false });
    
    if (error) throw new Error(`Failed to get user scores: ${error.message}`);
    return data as Score[];
  }

  async getTopScores(limit: number = 10): Promise<(Score & { user: User })[]> {
    const { data, error } = await this.supabase
      .from('scores')
      .select(`
        *,
        user:users(*)
      `)
      .order('score', { ascending: false })
      .limit(limit);
    
    if (error) throw new Error(`Failed to get top scores: ${error.message}`);
    return data as (Score & { user: User })[];
  }
}

// Use Supabase storage for production
console.log('Using Supabase storage');
const storage = new SupabaseStorage();

export { storage };
