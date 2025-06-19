// config/postgresql.go
package config

import (
    "database/sql"
    _ "github.com/lib/pq"
    "log"
)

var PostgreSQL *sql.DB

func InitPostgreSQL() {
    db, err := sql.Open("postgres", AppConfig.PostgresURI)
    if err != nil {
        log.Fatal("Failed to connect to PostgreSQL:", err)
    }

    // Test connection
    if err = db.Ping(); err != nil {
        log.Fatal("Failed to ping PostgreSQL:", err)
    }

    PostgreSQL = db
    log.Println("Connected to PostgreSQL successfully")

    // Create tables
    createTables()
}

func createTables() {
    queries := []string{
        `CREATE TABLE IF NOT EXISTS metrics (
            id SERIAL PRIMARY KEY,
            metric_name VARCHAR(100) NOT NULL,
            value FLOAT NOT NULL,
            labels JSONB,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE INDEX IF NOT EXISTS idx_metrics_name_timestamp ON metrics(metric_name, timestamp)`,
        `CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp)`,
    }

    for _, query := range queries {
        if _, err := PostgreSQL.Exec(query); err != nil {
            log.Fatal("Failed to execute query:", query, "Error:", err)
        }
    }

    log.Println("PostgreSQL tables created successfully")
}
