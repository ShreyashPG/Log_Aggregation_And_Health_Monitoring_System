// package config

// import (
// 	"github.com/prometheus/client_golang/prometheus"
// 	"github.com/yourusername/log-aggregation-system/handlers"
// )

// func InitPrometheus() {
// 	// Register metrics
// 	prometheus.MustRegister(handlers.requestCount)
// 	prometheus.MustRegister(handlers.requestLatency)
// }

package config

import (
	"github.com/prometheus/client_golang/prometheus"
)

var (
	RequestLatency = prometheus.NewHistogram(prometheus.HistogramOpts{
		Name: "http_request_latency_seconds",
		Help: "Request latency",
	})
	LogErrorsTotal = prometheus.NewCounter(prometheus.CounterOpts{
		Name: "log_errors_total",
		Help: "Total number of error logs",
	})
)

func InitPrometheus() {
	prometheus.MustRegister(RequestLatency, LogErrorsTotal)
}