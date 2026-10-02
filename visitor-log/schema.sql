CREATE TABLE IF NOT EXISTS visit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visited_at TEXT NOT NULL,
  ip TEXT NOT NULL,
  path TEXT NOT NULL,
  referrer TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_visit_logs_visited_at
  ON visit_logs (visited_at DESC);

CREATE INDEX IF NOT EXISTS idx_visit_logs_path
  ON visit_logs (path);

-- Keep page totals after the detailed visit logs expire. Re-running this file
-- backfills an existing installation without decreasing totals already stored.
CREATE TABLE IF NOT EXISTS page_view_totals (
  path TEXT PRIMARY KEY,
  views INTEGER NOT NULL DEFAULT 0 CHECK (views >= 0)
);

INSERT INTO page_view_totals (path, views)
SELECT path, COUNT(*)
FROM visit_logs
WHERE 1
GROUP BY path
ON CONFLICT(path) DO UPDATE SET
  views = MAX(page_view_totals.views, excluded.views);
