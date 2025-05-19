package models

import "time"

type FileMetadata struct {
	ID         string    `bson:"_id,omitempty" json:"id"`
	FileName   string    `bson:"filename" json:"filename"`
	UserEmail  string    `bson:"user_email" json:"user_email"`
	UploadTime time.Time `bson:"upload_time" json:"upload_time"`
	Size       int64     `bson:"size" json:"size"`
}