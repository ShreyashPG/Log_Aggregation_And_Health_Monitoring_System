// handlers/analytics.go
package handlers

import (
    "backend/config"
    "context"
    "net/http"
    "time"
		"strconv"
    "github.com/gin-gonic/gin"
    "go.mongodb.org/mongo-driver/bson"
)

type AnalyticsResult struct {
    Service    string `json:"service"`
    ErrorCount int    `json:"errorCount"`
}

type LogLevelStats struct {
    Level string `json:"level"`
    Count int    `json:"count"`
}

type ServiceStats struct {
    Service string `json:"service"`
    Count   int    `json:"count"`
}

func GetLogAnalytics(c *gin.Context) {
    userEmail := c.GetString("email")
    hoursParam := c.DefaultQuery("hours", "24")
    
    hours, err := strconv.Atoi(hoursParam)
    if err != nil || hours <= 0 {
        hours = 24
    }

    collection := config.GetCollection("logs")
    timeFilter := time.Now().Add(-time.Duration(hours) * time.Hour)

    // Error count by service
    errorPipeline := []bson.M{
        {"$match": bson.M{
            "userEmail": userEmail,
            "level":     "error",
            "timestamp": bson.M{"$gte": timeFilter},
        }},
        {"$group": bson.M{
            "_id":        "$service",
            "errorCount": bson.M{"$sum": 1},
        }},
        {"$project": bson.M{
            "service":    "$_id",
            "errorCount": 1,
            "_id":        0,
        }},
        {"$sort": bson.M{"errorCount": -1}},
    }

    cursor, err := collection.Aggregate(context.Background(), errorPipeline)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch error analytics"})
        return
    }

    var errorResults []AnalyticsResult
    if err := cursor.All(context.Background(), &errorResults); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode error analytics"})
        return
    }

    // Log level distribution
    levelPipeline := []bson.M{
        {"$match": bson.M{
            "userEmail": userEmail,
            "timestamp": bson.M{"$gte": timeFilter},
        }},
        {"$group": bson.M{
            "_id":   "$level",
            "count": bson.M{"$sum": 1},
        }},
        {"$project": bson.M{
            "level": "$_id",
            "count": 1,
            "_id":   0,
        }},
    }

    cursor, err = collection.Aggregate(context.Background(), levelPipeline)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch level analytics"})
        return
    }

    var levelStats []LogLevelStats
    if err := cursor.All(context.Background(), &levelStats); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode level analytics"})
        return
    }

    // Service distribution
    servicePipeline := []bson.M{
        {"$match": bson.M{
            "userEmail": userEmail,
            "timestamp": bson.M{"$gte": timeFilter},
        }},
        {"$group": bson.M{
            "_id":   "$service",
            "count": bson.M{"$sum": 1},
        }},
        {"$project": bson.M{
            "service": "$_id",
            "count":   1,
            "_id":     0,
        }},
        {"$sort": bson.M{"count": -1}},
    }

    cursor, err = collection.Aggregate(context.Background(), servicePipeline)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch service analytics"})
        return
    }

    var serviceStats []ServiceStats
    if err := cursor.All(context.Background(), &serviceStats); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode service analytics"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "errors_by_service": errorResults,
        "logs_by_level":     levelStats,
        "logs_by_service":   serviceStats,
        "time_range_hours":  hours,
        "generated_at":      time.Now(),
    })
}
