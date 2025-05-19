package handlers

import (
	"context"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
	"github.com/yourusername/log-aggregation-system/config"
	"github.com/yourusername/log-aggregation-system/models"
	"go.mongodb.org/mongo-driver/bson"
	"io"
	"net/http"
	"strconv"
	"time"
)

func UploadFile(c *gin.Context) {
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file"})
		return
	}
	defer file.Close()

	userEmail := c.PostForm("userEmail")
	fileName := strconv.FormatInt(time.Now().Unix(), 10) + "_" + header.Filename

	// Configure B2 client
	cfg, _ := config.LoadDefaultConfig(context.Background(),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider("your-key-id", "your-application-key", "")),
		config.WithRegion("us-west-2"),
	)
	s3Client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String("https://s3.us-west-000.backblazeb2.com")
	})

	// Upload to B2
	_, err = s3Client.PutObject(context.Background(), &s3.PutObjectInput{
		Bucket: aws.String("your-bucket-name"),
		Key:    aws.String(fileName),
		Body:   file,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload file"})
		return
	}

	// Save metadata to MongoDB
	metadata := models.FileMetadata{
		FileName:   fileName,
		UserEmail:  userEmail,
		UploadTime: time.Now(),
		Size:       header.Size,
	}
	collection := config.MongoDB.Database("log_system").Collection("file_metadata")
	_, err = collection.InsertOne(context.Background(), metadata)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save metadata"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "File uploaded successfully", "filename": fileName})
}

func DownloadFile(c *gin.Context) {
	fileName := c.Param("filename")
	s3Client := s3.NewFromConfig(config.Must(config.LoadDefaultConfig(context.Background(),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider("your-key-id", "your-application-key", "")),
		config.WithRegion("us-west-2"),
	)), func(o *s3.Options) {
		o.BaseEndpoint = aws.String("https://s3.us-west-000.backblazeb2.com")
	})

	// Download from B2
	result, err := s3Client.GetObject(context.Background(), &s3.GetObjectInput{
		Bucket: aws.String("your-bucket-name"),
		Key:    aws.String(fileName),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to download file"})
		return
	}
	defer result.Body.Close()

	// Stream file to response
	c.Header("Content-Disposition", "attachment; filename="+fileName)
	_, err = io.Copy(c.Writer, result.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to stream file"})
		return
	}
}