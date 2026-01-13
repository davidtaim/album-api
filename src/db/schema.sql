CREATE TABLE IF NOT EXISTS album (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      message TEXT NOT NULL,
      url_image TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
