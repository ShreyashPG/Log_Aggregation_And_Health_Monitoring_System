// handlers/files.go
package handlers

import (
	"context"
	"fmt"
	"io"
	"logmonitor/config"
	"logmonitor/models"
	"net/http"

	// "path/filepath"
	"time"

	bson "go.mongodb.org/mongo-driver/bson"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsConfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func UploadFile(c *gin.Context) {
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file: " + err.Error()})
		return
	}
	defer file.Close()

	userEmail := c.GetString("email")

	// Generate unique filename
	fileName := fmt.Sprintf("%d_%s_%s",
		time.Now().Unix(),
		userEmail,
		header.Filename)

	// Validate file size (10MB limit)
	if header.Size > 10*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File size exceeds 10MB limit"})
		return
	}

	// Configure S3 client only if credentials are provided
	if config.AppConfig.S3KeyID != "" && config.AppConfig.S3AppKey != "" {
		cfg, err := awsConfig.LoadDefaultConfig(context.Background(),
			awsConfig.WithCredentialsProvider(
				credentials.NewStaticCredentialsProvider(
					config.AppConfig.S3KeyID,
					config.AppConfig.S3AppKey,
					"",
				),
			),
			awsConfig.WithRegion("us-west-2"),
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to configure storage client"})
			return
		}

		s3Client := s3.NewFromConfig(cfg, func(o *s3.Options) {
			o.BaseEndpoint = aws.String(config.AppConfig.S3Endpoint)
		})

		// Upload to S3
		_, err = s3Client.PutObject(context.Background(), &s3.PutObjectInput{
			Bucket:      aws.String(config.AppConfig.S3BucketName),
			Key:         aws.String(fileName),
			Body:        file,
			ContentType: aws.String(header.Header.Get("Content-Type")),
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload file to storage"})
			return
		}
	}

	// Save metadata to MongoDB
	metadata := models.FileMetadata{
		ID:           primitive.NewObjectID(),
		FileName:     fileName,
		OriginalName: header.Filename,
		UserEmail:    userEmail,
		UploadTime:   time.Now(),
		Size:         header.Size,
		ContentType:  header.Header.Get("Content-Type"),
		IsActive:     true,
	}

	collection := config.GetCollection("file_metadata")
	_, err = collection.InsertOne(context.Background(), metadata)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file metadata"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "File uploaded successfully",
		"filename": fileName,
		"file_id":  metadata.ID.Hex(),
		"size":     header.Size,
	})
}
func DownloadFile(c *gin.Context) {
	fileName := c.Param("filename")
	userEmail := c.GetString("email")

	// Verify file ownership
	collection := config.GetCollection("file_metadata")
	var metadata models.FileMetadata
	err := collection.FindOne(context.Background(), bson.M{
		"filename":  fileName,
		"useremail": userEmail,
		"isactive":  true,
	}).Decode(&metadata)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found or access denied"})
		return
	}

	// Check if S3 credentials are configured
	if config.AppConfig.S3KeyID == "" || config.AppConfig.S3AppKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Storage service not configured"})
		return
	}

	// Configure S3 client
	cfg, err := awsConfig.LoadDefaultConfig(context.Background(),
		awsConfig.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(
				config.AppConfig.S3KeyID,
				config.AppConfig.S3AppKey,
				"",
			),
		),
		awsConfig.WithRegion("us-west-2"),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to configure storage client"})
		return
	}

	s3Client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(config.AppConfig.S3Endpoint)
	})

	// Download from S3
	result, err := s3Client.GetObject(context.Background(), &s3.GetObjectInput{
		Bucket: aws.String(config.AppConfig.S3BucketName),
		Key:    aws.String(fileName),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to download file from storage"})
		return
	}
	defer result.Body.Close()

	// Set appropriate headers
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", metadata.OriginalName))
	c.Header("Content-Type", metadata.ContentType)
	if result.ContentLength != nil {
		c.Header("Content-Length", fmt.Sprintf("%d", *result.ContentLength))
	}

	// Stream file to response
	_, err = io.Copy(c.Writer, result.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to stream file"})
		return
	}
}
