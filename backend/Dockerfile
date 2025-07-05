# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o main .

# Final stage
FROM alpine:latest

# Install ca-certificates for HTTPS and sqlite for database
RUN apk --no-cache add ca-certificates sqlite

WORKDIR /root/

# Copy the binary from builder stage
COPY --from=builder /app/main .

# Create directory for database
RUN mkdir -p /root/data

# Expose port
EXPOSE 8080

# Command to run
CMD ["./main"]