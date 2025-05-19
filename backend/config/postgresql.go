package config

import (
	"database/sql"
	_ "github.com/lib/pq"
	"log"
)

var PostgreSQL *sql.DB

func InitPostgreSQL() {
	connStr := "postgres://postgres:password@localhost:5432/log_system?sslmode=disable"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Failed to connect to PostgreSQL:", err)
	}
	PostgreSQL = db

	// Create metrics table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS metrics (
			id SERIAL PRIMARY KEY,
			metric_name VARCHAR(100),
			value FLOAT,
			timestamp TIMESTAMP
		)
	`)
	if err != nil {
		log.Fatal("Failed to create metrics table:", err)
	}
}