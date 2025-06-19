package main

import (
	"backend/config"
	"backend/handlers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)
func main() {
	// Initialize configs and DBs
	config.LoadConfig()
	config.InitMongoDB()
	config.InitPostgreSQL()

	// Create Gin router
	r := gin.Default()

	// ✅ Apply CORS middleware globally
	r.Use(middleware.CORSMiddleware())

	// Prometheus metrics
	r.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// Public routes
	r.POST("/auth/signup", handlers.Signup)
	r.POST("/auth/login", handlers.Login)

	// Protected routes
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware(), middleware.MetricsMiddleware()) // CORS already applied globally

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