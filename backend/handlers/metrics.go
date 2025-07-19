package handlers

import (
	"logmonitor/config" // ✅ Replace this with your actual module name (check go.mod)
	"time"
)

func RecordRequest(endpoint, method, status string, start time.Time) {
	duration := time.Since(start).Seconds()

	config.APIRequestsTotal.WithLabelValues(method, endpoint, status).Inc()
	config.RequestLatency.WithLabelValues(method, endpoint, status).Observe(duration)
}
