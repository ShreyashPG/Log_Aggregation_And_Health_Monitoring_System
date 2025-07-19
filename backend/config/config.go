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
    S3KeyID         string
    S3AppKey        string
    S3BucketName    string
    S3Endpoint      string
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
        S3KeyID:      getEnv("S3_KEY_ID", ""),
        S3AppKey:     getEnv("S3_APP_KEY", ""),
        S3BucketName: getEnv("S3_BUCKET_NAME", ""),
        S3Endpoint:   getEnv("S3_ENDPOINT", "https://s3.us-west-000.backblazeb2.com"),
    }
}

func getEnv(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}
