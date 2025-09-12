import { users, type User, type InsertUser, type Score, type InsertScore } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  addScore(score: InsertScore): Promise<Score>;
  getUserScores(userId: number): Promise<Score[]>;
  getTopScores(limit?: number): Promise<(Score & { user: User })[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
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
    const id = this.currentId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async addScore(score: InsertScore): Promise<Score> {
    throw new Error("MemStorage score operations not implemented - use Supabase storage");
  }

  async getUserScores(userId: number): Promise<Score[]> {
    throw new Error("MemStorage score operations not implemented - use Supabase storage");
  }

  async getTopScores(limit?: number): Promise<(Score & { user: User })[]> {
    throw new Error("MemStorage score operations not implemented - use Supabase storage");
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
    const { data, error } = await this.supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return data as User;
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

// Use Supabase storage if environment variables are available, otherwise fallback to memory
const useSupabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY;
export const storage: IStorage = useSupabase ? new SupabaseStorage() : new MemStorage();
