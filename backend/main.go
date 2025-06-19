package main

import (
	"backend/config"
	"backend/handlers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func main() {
	// Initialize database connections
	// ✅ 1. Load config first
	config.LoadConfig()
	// ✅ 2. Initialize MongoDB and PostgreSQL connections
	config.InitMongoDB()
	// ✅ 3. Initialize PostgreSQL connection
	config.InitPostgreSQL()

	// Create Gin router
	r := gin.Default()

	// Prometheus metrics
	r.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// Routes
	r.POST("/auth/signup", handlers.Signup)
	r.POST("/auth/login", handlers.Login)

	// Protected routes
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.POST("/logs", handlers.IngestLog)
		protected.GET("/logs", handlers.QueryLogs)
		protected.POST("/files/upload", handlers.UploadFile)
		protected.GET("/files/download/:filename", handlers.DownloadFile)
		protected.GET("/analytics", handlers.GetLogAnalytics)
	}

	// Start server
	r.Run(":8080")
}
