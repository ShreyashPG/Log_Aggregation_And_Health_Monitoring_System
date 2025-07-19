// middleware/metrics.go
package middleware

import (
	"logmonitor/config"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func MetricsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		c.Next()

		duration := time.Since(start).Seconds()
		status := strconv.Itoa(c.Writer.Status())

		config.APIRequestsTotal.WithLabelValues(c.Request.Method, c.FullPath(), status).Inc()
		config.RequestLatency.WithLabelValues(c.Request.Method, c.FullPath(), status).Observe(duration)
	}
}
