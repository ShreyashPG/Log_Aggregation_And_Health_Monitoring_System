package config

import (
	"context"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"log"
)

var MongoDB *mongo.Client

func InitMongoDB() {
	clientOptions := options.Client().ApplyURI("mongodb://mongo1:27017,mongo2:27017,mongo3:27017/?replicaSet=rs0")
	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}
	MongoDB = client
}