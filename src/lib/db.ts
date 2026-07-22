import { getDB } from "../db";

export interface User {
  id: number;
  username: string;
  role: "admin" | "user";
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  body: string;
  status: "draft" | "published";
  author_id: number;
  created_at: string;
  updated_at: string;
}

export interface Content {
  id: number;
  key: string;
  title: string;
  body: string;
  updated_at: string;
}

export function getUserByUsername(
  username: string
): (User & { password_hash: string }) | undefined {
  return getDB()
    .query("SELECT * FROM users WHERE username = ?")
    .get(username) as (User & { password_hash: string }) | undefined;
}

export function getUserById(id: number): User | undefined {
  return getDB()
    .query("SELECT id, username, role, created_at, updated_at FROM users WHERE id = ?")
    .get(id) as User | undefined;
}

export function getAllUsers(): User[] {
  return getDB()
    .query("SELECT id, username, role, created_at, updated_at FROM users ORDER BY id DESC")
    .all() as User[];
}

export function createUser(username: string, passwordHash: string, role: string): User {
  const result = getDB()
    .query("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)")
    .run(username, passwordHash, role);
  return getUserById(Number(result.lastInsertRowid))!;
}

export function updateUser(
  id: number,
  data: { username?: string; password_hash?: string; role?: string }
): User | undefined {
  const sets: string[] = [];
  const values: (string | number)[] = [];

  if (data.username !== undefined) {
    sets.push("username = ?");
    values.push(data.username);
  }
  if (data.password_hash !== undefined) {
    sets.push("password_hash = ?");
    values.push(data.password_hash);
  }
  if (data.role !== undefined) {
    sets.push("role = ?");
    values.push(data.role);
  }

  if (sets.length === 0) return getUserById(id);

  sets.push("updated_at = datetime('now')");
  values.push(id);

  getDB()
    .query(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`)
    .run(...values);

  return getUserById(id);
}

export function deleteUser(id: number): boolean {
  const result = getDB().query("DELETE FROM users WHERE id = ?").run(id);
  return result.changes > 0;
}

export function getPosts(authorId?: number): Post[] {
  if (authorId) {
    return getDB()
      .query("SELECT * FROM posts WHERE author_id = ? ORDER BY id DESC")
      .all(authorId) as Post[];
  }
  return getDB().query("SELECT * FROM posts ORDER BY id DESC").all() as Post[];
}

export function getPostById(id: number, authorId?: number): Post | undefined {
  if (authorId) {
    return getDB()
      .query("SELECT * FROM posts WHERE id = ? AND author_id = ?")
      .get(id, authorId) as Post | undefined;
  }
  return getDB()
    .query("SELECT * FROM posts WHERE id = ?")
    .get(id) as Post | undefined;
}

export function createPost(
  title: string,
  slug: string,
  body: string,
  status: string,
  authorId: number
): Post {
  const result = getDB()
    .query(
      "INSERT INTO posts (title, slug, body, status, author_id) VALUES (?, ?, ?, ?, ?)"
    )
    .run(title, slug, body, status, authorId);
  return getPostById(Number(result.lastInsertRowid))!;
}

export function updatePost(
  id: number,
  data: { title?: string; slug?: string; body?: string; status?: string }
): Post | undefined {
  const sets: string[] = [];
  const values: (string | number)[] = [];

  if (data.title !== undefined) {
    sets.push("title = ?");
    values.push(data.title);
  }
  if (data.slug !== undefined) {
    sets.push("slug = ?");
    values.push(data.slug);
  }
  if (data.body !== undefined) {
    sets.push("body = ?");
    values.push(data.body);
  }
  if (data.status !== undefined) {
    sets.push("status = ?");
    values.push(data.status);
  }

  if (sets.length === 0) return getPostById(id);

  sets.push("updated_at = datetime('now')");
  values.push(id);

  getDB()
    .query(`UPDATE posts SET ${sets.join(", ")} WHERE id = ?`)
    .run(...values);

  return getPostById(id);
}

export function deletePost(id: number): boolean {
  const result = getDB().query("DELETE FROM posts WHERE id = ?").run(id);
  return result.changes > 0;
}

export function getAllContent(): Content[] {
  return getDB()
    .query("SELECT * FROM content ORDER BY id DESC")
    .all() as Content[];
}

export function getContentByKey(key: string): Content | undefined {
  return getDB()
    .query("SELECT * FROM content WHERE key = ?")
    .get(key) as Content | undefined;
}

export function getContentById(id: number): Content | undefined {
  return getDB()
    .query("SELECT * FROM content WHERE id = ?")
    .get(id) as Content | undefined;
}

export function createContent(key: string, title: string, body: string): Content {
  const result = getDB()
    .query("INSERT INTO content (key, title, body) VALUES (?, ?, ?)")
    .run(key, title, body);
  return getContentById(Number(result.lastInsertRowid))!;
}

export function updateContent(
  id: number,
  data: { key?: string; title?: string; body?: string }
): Content | undefined {
  const sets: string[] = [];
  const values: (string | number)[] = [];

  if (data.key !== undefined) {
    sets.push("key = ?");
    values.push(data.key);
  }
  if (data.title !== undefined) {
    sets.push("title = ?");
    values.push(data.title);
  }
  if (data.body !== undefined) {
    sets.push("body = ?");
    values.push(data.body);
  }

  if (sets.length === 0) return getContentById(id);

  sets.push("updated_at = datetime('now')");
  values.push(id);

  getDB()
    .query(`UPDATE content SET ${sets.join(", ")} WHERE id = ?`)
    .run(...values);

  return getContentById(id);
}

export function deleteContent(id: number): boolean {
  const result = getDB().query("DELETE FROM content WHERE id = ?").run(id);
  return result.changes > 0;
}

// ==================== SERVICES ====================

export interface Service {
  id: number;
  name: string;
  slug: string;
  base_url: string;
  api_key: string;
  is_active: number;
  created_at: string;
}

export interface UserPersona {
  user_id: number;
  persona_id: string;
  service_id: number;
  session_id: string | null;
  persona_name: string;
  created_at: string;
}

export function getAllServices(): Service[] {
  return getDB().query("SELECT * FROM services ORDER BY id DESC").all() as Service[];
}

export function getServiceById(id: number): Service | undefined {
  return getDB().query("SELECT * FROM services WHERE id = ?").get(id) as Service | undefined;
}

export function getServiceBySlug(slug: string): Service | undefined {
  return getDB().query("SELECT * FROM services WHERE slug = ?").get(slug) as Service | undefined;
}

export function createService(name: string, slug: string, base_url: string, api_key: string): Service {
  const result = getDB()
    .query("INSERT INTO services (name, slug, base_url, api_key) VALUES (?, ?, ?, ?)")
    .run(name, slug, base_url, api_key);
  return getServiceById(Number(result.lastInsertRowid))!;
}

export function updateService(id: number, data: { name?: string; base_url?: string; api_key?: string; is_active?: number }): Service | undefined {
  const sets: string[] = [];
  const values: (string | number)[] = [];
  if (data.name !== undefined) { sets.push("name = ?"); values.push(data.name); }
  if (data.base_url !== undefined) { sets.push("base_url = ?"); values.push(data.base_url); }
  if (data.api_key !== undefined) { sets.push("api_key = ?"); values.push(data.api_key); }
  if (data.is_active !== undefined) { sets.push("is_active = ?"); values.push(data.is_active); }
  if (sets.length === 0) return getServiceById(id);
  values.push(id);
  getDB().query(`UPDATE services SET ${sets.join(", ")} WHERE id = ?`).run(...values);
  return getServiceById(id);
}

export function deleteService(id: number): boolean {
  const result = getDB().query("DELETE FROM services WHERE id = ?").run(id);
  return result.changes > 0;
}

// ==================== USER SERVICES ====================

export function getUserServices(userId: number): number[] {
  const rows = getDB()
    .query("SELECT service_id FROM user_services WHERE user_id = ?")
    .all(userId) as { service_id: number }[];
  return rows.map(r => r.service_id);
}

export function getServicesForUser(userId: number): Service[] {
  const ids = getUserServices(userId);
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => "?").join(",");
  return getDB()
    .query(`SELECT * FROM services WHERE id IN (${placeholders}) AND is_active = 1 ORDER BY name ASC`)
    .all(...ids) as Service[];
}

export function assignUserService(userId: number, serviceId: number): void {
  getDB()
    .query("INSERT OR IGNORE INTO user_services (user_id, service_id) VALUES (?, ?)")
    .run(userId, serviceId);
}

export function removeUserService(userId: number, serviceId: number): void {
  getDB()
    .query("DELETE FROM user_services WHERE user_id = ? AND service_id = ?")
    .run(userId, serviceId);
}

// ==================== USER PERSONAS ====================

export function getUserPersonas(userId: number): UserPersona[] {
  return getDB()
    .query("SELECT * FROM user_personas WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as UserPersona[];
}

export function getPersonaOwner(personaId: string): UserPersona | undefined {
  return getDB()
    .query("SELECT * FROM user_personas WHERE persona_id = ?")
    .get(personaId) as UserPersona | undefined;
}

export function linkUserPersona(userId: number, personaId: string, serviceId: number, personaName: string): void {
  getDB()
    .query("INSERT INTO user_personas (user_id, persona_id, service_id, persona_name) VALUES (?, ?, ?, ?)")
    .run(userId, personaId, serviceId, personaName);
}

export function updatePersonaSession(personaId: string, sessionId: string): void {
  getDB()
    .query("UPDATE user_personas SET session_id = ? WHERE persona_id = ?")
    .run(sessionId, personaId);
}

export function unlinkUserPersona(personaId: string): void {
  getDB()
    .query("DELETE FROM user_personas WHERE persona_id = ?")
    .run(personaId);
}
