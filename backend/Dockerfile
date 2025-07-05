# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev sqlite-dev

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=1 GOOS=linux go build -o presensi-backend .

# Final stage
FROM alpine:latest

# Install runtime dependencies
RUN apk --no-cache add ca-certificates sqlite

WORKDIR /root/

# Copy the binary from builder stage
COPY --from=builder /app/presensi-backend .

# Create database directory
RUN mkdir -p /root/database

# Expose port
EXPOSE 8080

# Command to run
CMD ["./presensi-backend"]