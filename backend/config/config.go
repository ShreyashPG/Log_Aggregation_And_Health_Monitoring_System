package config

import (
    "log"
    "os"
    "github.com/joho/godotenv"
)

type Config struct {
    MongoURI        string
    PostgresURI     string
    JWTSecret       string
    ServerPort      string
    B2KeyID         string
    B2AppKey        string
    B2BucketName    string
    B2Endpoint      string
}

var AppConfig *Config

func LoadConfig() {
    err := godotenv.Load()
    if err != nil {
        log.Println("No .env file found, using environment variables")
    }

    AppConfig = &Config{
        MongoURI:     getEnv("MONGO_URI", "mongodb://localhost:27017"),
        PostgresURI:  getEnv("POSTGRES_URI", "postgres://postgres:password@localhost:5432/log_system?sslmode=disable"),
        JWTSecret:    getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
        ServerPort:   getEnv("SERVER_PORT", "8080"),
        B2KeyID:      getEnv("B2_KEY_ID", ""),
        B2AppKey:     getEnv("B2_APP_KEY", ""),
        B2BucketName: getEnv("B2_BUCKET_NAME", ""),
        B2Endpoint:   getEnv("B2_ENDPOINT", "https://s3.us-west-000.backblazeb2.com"),
    }
}

func getEnv(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}
