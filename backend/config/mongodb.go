package config

import (
    "context"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
    "log"
    "time"
)

var MongoDB *mongo.Client

func InitMongoDB() {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    clientOptions := options.Client().ApplyURI(AppConfig.MongoURI)
    client, err := mongo.Connect(ctx, clientOptions)
    if err != nil {
        log.Fatal("Failed to connect to MongoDB:", err)
    }

    // Test the connection
    err = client.Ping(ctx, nil)
    if err != nil {
        log.Fatal("Failed to ping MongoDB:", err)
    }

    MongoDB = client
    log.Println("Connected to MongoDB successfully")

    // Create indexes for better performance
    createIndexes()
}

func createIndexes() {
    db := MongoDB.Database("log_system")
    
    // Users collection indexes
    usersCollection := db.Collection("users")
    usersCollection.Indexes().CreateOne(context.Background(), mongo.IndexModel{
        Keys: map[string]int{"email": 1},
        Options: options.Index().SetUnique(true),
    })

    // Logs collection indexes
    logsCollection := db.Collection("logs")
    logsCollection.Indexes().CreateMany(context.Background(), []mongo.IndexModel{
        {Keys: map[string]int{"userEmail": 1, "timestamp": -1}},
        {Keys: map[string]int{"service": 1, "level": 1}},
        {Keys: map[string]int{"timestamp": -1}},
    })

    log.Println("MongoDB indexes created successfully")
}

func GetCollection(name string) *mongo.Collection {
    return MongoDB.Database("log_system").Collection(name)
}
