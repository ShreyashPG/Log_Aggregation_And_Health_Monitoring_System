package models

import "time"

type Log struct {
	Timestamp time.Time `bson:"timestamp" json:"timestamp"`
	Service   string    `bson:"service" json:"service"`
	Message   string    `bson:"message" json:"message"`
	Level     string    `bson:"level" json:"level"`
}