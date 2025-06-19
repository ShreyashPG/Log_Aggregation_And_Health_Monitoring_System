// models/log.go
package models

import (
    "time"
    "go.mongodb.org/mongo-driver/bson/primitive"
)

type Log struct {
    ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    Timestamp time.Time          `bson:"timestamp" json:"timestamp"`
    Service   string             `bson:"service" json:"service" binding:"required"`
    Message   string             `bson:"message" json:"message" binding:"required"`
    Level     string             `bson:"level" json:"level" binding:"required"`
    UserEmail string             `bson:"userEmail" json:"userEmail"`
    Metadata  map[string]interface{} `bson:"metadata,omitempty" json:"metadata,omitempty"`
    CreatedAt time.Time          `bson:"created_at" json:"created_at"`
}

type LogQuery struct {
    Service   string `form:"service"`
    Level     string `form:"level"`
    Keyword   string `form:"keyword"`
    StartTime string `form:"start_time"`
    EndTime   string `form:"end_time"`
    Page      int    `form:"page" binding:"min=1"`
    Limit     int    `form:"limit" binding:"min=1,max=1000"`
}