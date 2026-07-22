import { Database } from "bun:sqlite";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const DB_PATH = process.env.DB_PATH || "data/dam.db";

let db: Database;

export function getDB(): Database {
  if (!db) {
    db = new Database(DB_PATH, { create: true });
    db.exec("PRAGMA journal_mode=WAL");
    db.exec("PRAGMA foreign_keys=ON");
  }
  return db;
}

export function initDB(): void {
  const database = getDB();
  const schema = readFileSync(join(import.meta.dir, "schema.sql"), "utf-8");
  database.exec(schema);
}

export async function seedAdmin(): Promise<void> {
  const database = getDB();
  const existing = database
    .query("SELECT id FROM users WHERE username = ?")
    .get("admin") as { id: number } | undefined;

  if (existing) return;

  const passwordHash = await Bun.password.hash("admin123", "bcrypt");

  database
    .query("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)")
    .run("admin", passwordHash, "admin");

  console.log("✅ Admin user seeded: admin / admin123");
}
