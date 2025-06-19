// handlers/logs.go
package handlers

import (
    "backend/config"
    "backend/models"
    "context"
    "net/http"
    // "strconv"
    "time"

    "github.com/gin-gonic/gin"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"
    "go.mongodb.org/mongo-driver/mongo/options"
)

func IngestLog(c *gin.Context) {
    var log models.Log
    if err := c.ShouldBindJSON(&log); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
        return
    }

    userEmail := c.GetString("email")
    log.UserEmail = userEmail
    log.ID = primitive.NewObjectID()
    log.CreatedAt = time.Now()
    
    if log.Timestamp.IsZero() {
        log.Timestamp = time.Now()
    }

    collection := config.GetCollection("logs")
    _, err := collection.InsertOne(context.Background(), log)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save log"})
        return
    }

    // Update Prometheus metrics
    if log.Level == "error" {
        config.LogErrorsTotal.WithLabelValues(log.Service, userEmail).Inc()
    }

    c.JSON(http.StatusCreated, gin.H{
        "message": "Log ingested successfully",
        "log_id":  log.ID.Hex(),
    })
}

func QueryLogs(c *gin.Context) {
    var query models.LogQuery
    if err := c.ShouldBindQuery(&query); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters: " + err.Error()})
        return
    }

    // Set defaults
    if query.Page == 0 {
        query.Page = 1
    }
    if query.Limit == 0 {
        query.Limit = 50
    }

    userEmail := c.GetString("email")
    filter := bson.M{"userEmail": userEmail}

    // Add filters
    if query.Service != "" {
        filter["service"] = query.Service
    }
    if query.Level != "" {
        filter["level"] = query.Level
    }
    if query.Keyword != "" {
        filter["message"] = bson.M{"$regex": query.Keyword, "$options": "i"}
    }

    // Time range filter
    if query.StartTime != "" || query.EndTime != "" {
        timeFilter := bson.M{}
        if query.StartTime != "" {
            if startTime, err := time.Parse(time.RFC3339, query.StartTime); err == nil {
                timeFilter["$gte"] = startTime
            }
        }
        if query.EndTime != "" {
            if endTime, err := time.Parse(time.RFC3339, query.EndTime); err == nil {
                timeFilter["$lte"] = endTime
            }
        }
        if len(timeFilter) > 0 {
            filter["timestamp"] = timeFilter
        }
    }

    collection := config.GetCollection("logs")

    // Count total documents
    total, err := collection.CountDocuments(context.Background(), filter)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count logs"})
        return
    }

    // Find logs with pagination
    skip := (query.Page - 1) * query.Limit
    findOptions := options.Find().
        SetSort(bson.M{"timestamp": -1}).
        SetLimit(int64(query.Limit)).
        SetSkip(int64(skip))

    cursor, err := collection.Find(context.Background(), filter, findOptions)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch logs"})
        return
    }
    defer cursor.Close(context.Background())

    var logs []models.Log
    if err := cursor.All(context.Background(), &logs); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode logs"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "logs":        logs,
        "total":       total,
        "page":        query.Page,
        "limit":       query.Limit,
        "total_pages": (total + int64(query.Limit) - 1) / int64(query.Limit),
    })
}
