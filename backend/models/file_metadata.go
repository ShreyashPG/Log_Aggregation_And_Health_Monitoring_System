package models

import (
    "time"
    "go.mongodb.org/mongo-driver/bson/primitive"
)

type FileMetadata struct {
    ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    FileName   string             `bson:"filename" json:"filename"`
    OriginalName string           `bson:"original_name" json:"original_name"`
    UserEmail  string             `bson:"user_email" json:"user_email"`
    UploadTime time.Time          `bson:"upload_time" json:"upload_time"`
    Size       int64              `bson:"size" json:"size"`
    ContentType string            `bson:"content_type" json:"content_type"`
    IsActive   bool               `bson:"is_active" json:"is_active"`
}