package handlers

import (
	"context"
	"log-monitoring-system/config"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"net/http"
)

type AnalyticsResult struct {
	Service    string `json:"service"`
	ErrorCount int    `json:"errorCount"`
}

func GetLogAnalytics(c *gin.Context) {
	userEmail := c.GetString("email")
	collection := config.MongoDB.Collection("logs")

	pipeline := []bson.M{
		{"$match": bson.M{
			"userEmail": userEmail,
			"level":     "error",
			"timestamp": bson.M{"$gte": time.Now().Add(-24 * time.Hour)},
		}},
		{"$group": bson.M{
			"_id":         "$service",
			"errorCount": bson.M{"$sum": 1},
		}},
		{"$project": bson.M{
			"service":    "$_id",
			"errorCount": 1,
			"_id":        0,
		}},
	}

	cursor, err := collection.Aggregate(context.Background(), pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch analytics"})
		return
	}

	var results []AnalyticsResult
	if err := cursor.All(context.Background(), &results); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode analytics"})
		return
	}

	c.JSON(http.StatusOK, results)
}