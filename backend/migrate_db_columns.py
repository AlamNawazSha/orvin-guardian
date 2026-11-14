import sqlite3

def migrate():
    conn = sqlite3.connect("backend/automlops.db")
    cur = conn.cursor()
    cur.execute("PRAGMA table_info(incident_memories)")
    cols = [r[1] for r in cur.fetchall()]
    print("Existing columns:", cols)

    new_cols = [
        ("environment", "TEXT DEFAULT 'production'"),
        ("status", "TEXT DEFAULT 'active'"),
        ("superseded_by", "TEXT"),
        ("retirement_reason", "TEXT"),
        ("failed_fixes", "TEXT"),
        ("max_workers", "INTEGER")
    ]

    for name, defn in new_cols:
        if name not in cols:
            print(f"Adding column {name}...")
            cur.execute(f"ALTER TABLE incident_memories ADD COLUMN {name} {defn}")
    
    conn.commit()
    conn.close()
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
