package main

import (
	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/yourusername/log-aggregation-system/config"
	"github.com/yourusername/log-aggregation-system/handlers"
	"github.com/yourusername/log-aggregation-system/middleware"
)

func main() {
	// Initialize database connections
	config.InitMongoDB()
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