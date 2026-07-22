import bcrypt from "bcryptjs";
import fs from "fs";
import mysql, {
  type Pool,
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";
import path from "path";

type SqlArgs = (string | number | null)[];
type SqliteDatabase = import("better-sqlite3").Database;

const globalStore = globalThis as typeof globalThis & {
  __mysqlPool?: Pool;
  __sqlite?: SqliteDatabase;
  __dbReady?: boolean;
};

/** Use MySQL when DATABASE_DRIVER=mysql (cPanel). Local default is SQLite. */
function useMysql() {
  return process.env.DATABASE_DRIVER?.trim().toLowerCase() === "mysql";
}

function getMysqlConfig() {
  const host = process.env.MYSQL_HOST?.trim() || "localhost";
  const port = Number(process.env.MYSQL_PORT || 3306);
  const user = process.env.MYSQL_USER?.trim();
  const password = process.env.MYSQL_PASSWORD ?? "";
  const database = process.env.MYSQL_DATABASE?.trim();

  if (!user || !database) {
    throw new Error(
      "MySQL is not configured. Set MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, and DATABASE_DRIVER=mysql.",
    );
  }

  return { host, port, user, password, database };
}

function getPool() {
  if (!globalStore.__mysqlPool) {
    const config = getMysqlConfig();
    globalStore.__mysqlPool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 10,
      timezone: "+00:00",
    });
  }
  return globalStore.__mysqlPool;
}

function getSqlitePath() {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, "rent.db");
}

function getSqlite() {
  if (!globalStore.__sqlite) {
    // Lazy-load so MySQL-only cPanel deploys do not need the native module at boot.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require("better-sqlite3") as typeof import("better-sqlite3");
    const db = new Database(getSqlitePath());
    db.pragma("journal_mode = WAL");
    globalStore.__sqlite = db;
  }
  return globalStore.__sqlite;
}

async function mysqlTableExists(tableName: string) {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT TABLE_NAME
     FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [tableName],
  );
  return rows.length > 0;
}

async function mysqlGetColumns(tableName: string) {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [tableName],
  );
  return new Set(rows.map((row) => String(row.COLUMN_NAME)));
}

async function runMigrationsMysql() {
  const pool = getPool();

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS listings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      district VARCHAR(50) NOT NULL,
      place VARCHAR(255) NOT NULL,
      landmark VARCHAR(255) NOT NULL,
      property_type VARCHAR(50) NOT NULL DEFAULT 'flat',
      property_details TEXT NOT NULL,
      price INT NOT NULL DEFAULT 0,
      parking_two_wheeler INT NOT NULL DEFAULT 0,
      parking_four_wheeler INT NOT NULL DEFAULT 0,
      other_facilities TEXT NULL,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      role ENUM('agent', 'homeowner') NOT NULL,
      image_path VARCHAR(500) NULL,
      image_paths TEXT NULL,
      video_path VARCHAR(500) NULL,
      status ENUM('pending', 'active', 'stopped', 'taken') NOT NULL DEFAULT 'pending',
      featured TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS visit_orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      listing_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      status ENUM('new', 'contacted', 'closed') NOT NULL DEFAULT 'new',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS custom_orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      district VARCHAR(50) NOT NULL,
      place VARCHAR(255) NOT NULL,
      landmark VARCHAR(255) NOT NULL,
      property_type VARCHAR(50) NOT NULL,
      property_details TEXT NOT NULL,
      price_min INT NOT NULL,
      price_max INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      status ENUM('new', 'contacted', 'closed') NOT NULL DEFAULT 'new',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL UNIQUE,
      address TEXT NULL,
      password_hash VARCHAR(255) NOT NULL,
      blocked TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      listing_id INT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_listing (user_id, listing_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      remarks TEXT NULL,
      status ENUM('new', 'contacted', 'closed') NOT NULL DEFAULT 'new',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS news (
      id INT AUTO_INCREMENT PRIMARY KEY,
      heading VARCHAR(255) NOT NULL DEFAULT '',
      body TEXT NOT NULL,
      image_path VARCHAR(500) NULL,
      status ENUM('active', 'stopped') NOT NULL DEFAULT 'active',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  if (await mysqlTableExists("news")) {
    const newsColumns = await mysqlGetColumns("news");
    if (!newsColumns.has("heading")) {
      await pool.execute(
        `ALTER TABLE news ADD COLUMN heading VARCHAR(255) NOT NULL DEFAULT ''`,
      );
    }
  }

  if (await mysqlTableExists("users")) {
    const userColumns = await mysqlGetColumns("users");
    if (!userColumns.has("blocked")) {
      await pool.execute(
        `ALTER TABLE users ADD COLUMN blocked TINYINT(1) NOT NULL DEFAULT 0`,
      );
    }
  }

  if (await mysqlTableExists("listings")) {
    const columns = await mysqlGetColumns("listings");

    if (!columns.has("property_type")) {
      await pool.execute(
        `ALTER TABLE listings ADD COLUMN property_type VARCHAR(50) NOT NULL DEFAULT 'flat'`,
      );
    }
    if (!columns.has("price")) {
      await pool.execute(
        `ALTER TABLE listings ADD COLUMN price INT NOT NULL DEFAULT 0`,
      );
    }
    if (!columns.has("property_details")) {
      await pool.execute(
        `ALTER TABLE listings ADD COLUMN property_details TEXT NOT NULL`,
      );
    }
    if (!columns.has("image_paths")) {
      await pool.execute(`ALTER TABLE listings ADD COLUMN image_paths TEXT NULL`);
      await pool.execute(
        `UPDATE listings
         SET image_paths = JSON_ARRAY(image_path)
         WHERE image_path IS NOT NULL AND image_path != ''`,
      );
    }
    if (!columns.has("parking_two_wheeler")) {
      await pool.execute(
        `ALTER TABLE listings ADD COLUMN parking_two_wheeler INT NOT NULL DEFAULT 0`,
      );
    }
    if (!columns.has("parking_four_wheeler")) {
      await pool.execute(
        `ALTER TABLE listings ADD COLUMN parking_four_wheeler INT NOT NULL DEFAULT 0`,
      );
    }
    if (!columns.has("other_facilities")) {
      await pool.execute(
        `ALTER TABLE listings ADD COLUMN other_facilities TEXT NULL`,
      );
    }
    if (!columns.has("video_path")) {
      await pool.execute(
        `ALTER TABLE listings ADD COLUMN video_path VARCHAR(500) NULL`,
      );
    }
  }
}

function runMigrationsSqlite() {
  const db = getSqlite();

  db.exec(`
    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      district TEXT NOT NULL,
      place TEXT NOT NULL,
      landmark TEXT NOT NULL,
      property_type TEXT NOT NULL DEFAULT 'flat',
      property_details TEXT NOT NULL DEFAULT '',
      price INTEGER NOT NULL DEFAULT 0,
      parking_two_wheeler INTEGER NOT NULL DEFAULT 0,
      parking_four_wheeler INTEGER NOT NULL DEFAULT 0,
      other_facilities TEXT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('agent', 'homeowner')),
      image_path TEXT,
      image_paths TEXT,
      video_path TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'stopped', 'taken')),
      featured INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS visit_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'contacted', 'closed')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS custom_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      district TEXT NOT NULL,
      place TEXT NOT NULL,
      landmark TEXT NOT NULL,
      property_type TEXT NOT NULL,
      property_details TEXT NOT NULL DEFAULT '',
      price_min INTEGER NOT NULL,
      price_max INTEGER NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'contacted', 'closed')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      address TEXT,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      listing_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, listing_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      remarks TEXT,
      status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'contacted', 'closed')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      heading TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL,
      image_path TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'stopped')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const columns = db
    .prepare("PRAGMA table_info(listings)")
    .all() as { name: string }[];
  const names = new Set(columns.map((c) => c.name));

  const newsColumns = db
    .prepare("PRAGMA table_info(news)")
    .all() as { name: string }[];
  const newsNames = new Set(newsColumns.map((c) => c.name));
  if (!newsNames.has("heading")) {
    db.exec(`ALTER TABLE news ADD COLUMN heading TEXT NOT NULL DEFAULT ''`);
  }

  if (!names.has("property_type")) {
    db.exec(
      `ALTER TABLE listings ADD COLUMN property_type TEXT NOT NULL DEFAULT 'flat'`,
    );
  }
  if (!names.has("price")) {
    db.exec(`ALTER TABLE listings ADD COLUMN price INTEGER NOT NULL DEFAULT 0`);
  }
  if (!names.has("property_details")) {
    db.exec(
      `ALTER TABLE listings ADD COLUMN property_details TEXT NOT NULL DEFAULT ''`,
    );
  }
  if (!names.has("image_paths")) {
    db.exec(`ALTER TABLE listings ADD COLUMN image_paths TEXT`);
  }
  if (!names.has("parking_two_wheeler")) {
    db.exec(
      `ALTER TABLE listings ADD COLUMN parking_two_wheeler INTEGER NOT NULL DEFAULT 0`,
    );
  }
  if (!names.has("parking_four_wheeler")) {
    db.exec(
      `ALTER TABLE listings ADD COLUMN parking_four_wheeler INTEGER NOT NULL DEFAULT 0`,
    );
  }
  if (!names.has("other_facilities")) {
    db.exec(`ALTER TABLE listings ADD COLUMN other_facilities TEXT`);
  }
  if (!names.has("video_path")) {
    db.exec(`ALTER TABLE listings ADD COLUMN video_path TEXT`);
  }

  const userColumns = db
    .prepare("PRAGMA table_info(users)")
    .all() as { name: string }[];
  const userNames = new Set(userColumns.map((c) => c.name));
  if (!userNames.has("blocked")) {
    db.exec(`ALTER TABLE users ADD COLUMN blocked INTEGER NOT NULL DEFAULT 0`);
  }
}

async function seedAdminUser() {
  if (useMysql()) {
    const pool = getPool();
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM admin_users",
    );
    if (Number(rows[0]?.count) > 0) return;

    const username = process.env.ADMIN_USERNAME ?? "admin";
    const password = process.env.ADMIN_PASSWORD ?? "admin123";
    const passwordHash = bcrypt.hashSync(password, 10);
    await pool.execute(
      "INSERT INTO admin_users (username, password_hash) VALUES (?, ?)",
      [username, passwordHash],
    );
    return;
  }

  const db = getSqlite();
  const count = db
    .prepare("SELECT COUNT(*) as count FROM admin_users")
    .get() as { count: number };
  if (count.count > 0) return;

  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const passwordHash = bcrypt.hashSync(password, 10);
  db.prepare(
    "INSERT INTO admin_users (username, password_hash) VALUES (?, ?)",
  ).run(username, passwordHash);
}

export async function ensureDatabase() {
  if (useMysql()) {
    await runMigrationsMysql();
  } else {
    runMigrationsSqlite();
  }

  if (!globalStore.__dbReady) {
    await seedAdminUser();
    globalStore.__dbReady = true;
  }
}

export async function dbAll<T>(
  sql: string,
  args: SqlArgs = [],
): Promise<T[]> {
  await ensureDatabase();

  if (useMysql()) {
    const [rows] = await getPool().execute(sql, args);
    return rows as T[];
  }

  return getSqlite().prepare(sql).all(...args) as T[];
}

export async function dbGet<T>(
  sql: string,
  args: SqlArgs = [],
): Promise<T | undefined> {
  await ensureDatabase();

  if (useMysql()) {
    const [rows] = await getPool().execute(sql, args);
    return (rows as T[])[0];
  }

  return getSqlite().prepare(sql).get(...args) as T | undefined;
}

export async function dbRun(
  sql: string,
  args: SqlArgs = [],
): Promise<{ lastInsertRowid: number }> {
  await ensureDatabase();

  if (useMysql()) {
    const [result] = await getPool().execute<ResultSetHeader>(sql, args);
    return { lastInsertRowid: Number(result.insertId ?? 0) };
  }

  const result = getSqlite().prepare(sql).run(...args);
  return { lastInsertRowid: Number(result.lastInsertRowid) };
}

export function resolvePublicImagePath(imagePath: string): string {
  const relative = imagePath.replace(/^\//, "");
  return path.join(process.cwd(), "public", relative);
}

export function isReadOnlyFilesystem() {
  return false;
}
