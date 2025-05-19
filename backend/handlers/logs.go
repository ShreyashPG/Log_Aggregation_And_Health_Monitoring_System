// package handlers

// import (
// 	"context"
// 	"github.com/gin-gonic/gin"
// 	"github.com/yourusername/log-aggregation-system/config"
// 	"github.com/yourusername/log-aggregation-system/models"
// 	"go.mongodb.org/mongo-driver/bson"
// 	"go.mongodb.org/mongo-driver/mongo/options"
// 	"net/http"
// 	"time"
// )

// func IngestLog(c *gin.Context) {
// 	var log models.Log
// 	if err := c.ShouldBindJSON(&log); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
// 		return
// 	}

// 	log.Timestamp = time.Now()
// 	collection := config.MongoDB.Database("log_system").Collection("logs")
// 	_, err := collection.InsertOne(context.Background(), log)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to ingest log"})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{"message": "Log ingested successfully"})
// }

// func QueryLogs(c *gin.Context) {
// 	service := c.Query("service")
// 	level := c.Query("level")
// 	limit := int64(100)

// 	collection := config.MongoDB.Database("log_system").Collection("logs")
// 	filter := bson.M{}
// 	if service != "" {
// 		filter["service"] = service
// 	}
// 	if level != "" {
// 		filter["level"] = level
// 	}

// 	opts := options.Find().SetLimit(limit).SetSort(bson.M{"timestamp": -1})
// 	cursor, err := collection.Find(context.Background(), filter, opts)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query logs"})
// 		return
// 	}

// 	var logs []models.Log
// 	if err := cursor.All(context.Background(), &logs); err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode logs"})
// 		return
// 	}

// 	c.JSON(http.StatusOK, logs)
// }

package handlers

import (
	"context"
	"log-monitoring-system/config"
	"log-monitoring-system/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
	"net/http"
)

func GetLogs(c *gin.Context) {
	userEmail := c.GetString("email")
	service := c.Query("service")
	level := c.Query("level")
	keyword := c.Query("keyword")

	filter := bson.M{"userEmail": userEmail}
	if service != "" {
		filter["service"] = service
	}
	if level != "" {
		filter["level"] = level
	}
	if keyword != "" {
		filter["message"] = bson.M{"$regex": keyword, "$options": "i"}
	}

	collection := config.MongoDB.Collection("logs")
	findOptions := options.Find().SetSort(bson.M{"timestamp": -1}).SetLimit(100)
	cursor, err := collection.Find(context.Background(), filter, findOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch logs"})
		return
	}

	var logs []models.Log
	if err := cursor.All(context.Background(), &logs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode logs"})
		return
	}

	// Add to GetLogs after fetching logs
for _, log := range logs {
	if log.Level == "error" {
		config.LogErrorsTotal.Inc()
	}
}

	c.JSON(http.StatusOK, logs)
}