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
