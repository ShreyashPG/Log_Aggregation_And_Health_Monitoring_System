// package handlers

// import (
// 	"github.com/prometheus/client_golang/prometheus"
// 	"github.com/prometheus/client_golang/prometheus/promauto"
// )

// var (
// 	requestCount = promauto.NewCounterVec(
// 		prometheus.CounterOpts{
// 			Name: "api_requests_total",
// 			Help: "Total number of API requests",
// 		},
// 		[]string{"endpoint", "method"},
// 	)
// 	requestLatency = promauto.NewHistogramVec(
// 		prometheus.HistogramOpts{
// 			Name: "api_request_duration_seconds",
// 			Help: "API request latency in seconds",
// 			Buckets: prometheus.DefBuckets,
// 		},
// 		[]string{"endpoint"},
// 	)
// )

// func RecordRequest(endpoint, method string, duration float64) {
// 	requestCount.WithLabelValues(endpoint, method).Inc()
// 	requestLatency.WithLabelValues(endpoint).Observe(duration)
// }

package handlers

import (
	"time"
	"backend/config" // ✅ Replace this with your actual module name (check go.mod)
)

func RecordRequest(endpoint, method, status string, start time.Time) {
	duration := time.Since(start).Seconds()

	config.APIRequestsTotal.WithLabelValues(method, endpoint, status).Inc()
	config.RequestLatency.WithLabelValues(method, endpoint, status).Observe(duration)
}
