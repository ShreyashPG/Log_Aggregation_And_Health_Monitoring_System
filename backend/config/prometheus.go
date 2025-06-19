package config

import (
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promauto"
	"log"
)

var (
    RequestLatency = promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name: "http_request_duration_seconds",
            Help: "Request latency in seconds",
            Buckets: prometheus.DefBuckets,
        },
        []string{"method", "endpoint", "status"},
    )

    LogErrorsTotal = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "log_errors_total",
            Help: "Total number of error logs",
        },
        []string{"service", "user"},
    )

    APIRequestsTotal = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "api_requests_total",
            Help: "Total number of API requests",
        },
        []string{"method", "endpoint", "status"},
    )

    ActiveConnections = promauto.NewGauge(
        prometheus.GaugeOpts{
            Name: "active_connections",
            Help: "Number of active connections",
        },
    )
)

func InitPrometheus() {
    prometheus.MustRegister(RequestLatency, LogErrorsTotal, APIRequestsTotal, ActiveConnections)
    log.Println("Prometheus metrics initialized")
}
