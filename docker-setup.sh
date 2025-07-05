#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Presensi - Docker Setup Script${NC}"
echo "=================================="

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev      Start development environment"
    echo "  prod     Start production environment"
    echo "  build    Build all Docker images"
    echo "  stop     Stop all containers"
    echo "  clean    Remove all containers and images"
    echo "  logs     Show logs from all services"
    echo "  help     Show this help message"
    echo ""
}

# Function to check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
        exit 1
    fi
}

# Function to start development environment
start_dev() {
    echo -e "${YELLOW}🚀 Starting development environment...${NC}"
    docker-compose -f docker-compose.dev.yml up --build -d
    
    echo ""
    echo -e "${GREEN}✅ Development environment started!${NC}"
    echo -e "${BLUE}📱 Frontend: http://localhost:3000${NC}"
    echo -e "${BLUE}🔧 Backend API: http://localhost:8080${NC}"
    echo ""
    echo -e "${YELLOW}💡 Use 'docker logs -f presensi-frontend-dev-1' to see frontend logs${NC}"
    echo -e "${YELLOW}💡 Use 'docker logs -f presensi-backend-dev-1' to see backend logs${NC}"
}

# Function to start production environment
start_prod() {
    echo -e "${YELLOW}🚀 Starting production environment...${NC}"
    docker-compose up --build -d
    
    echo ""
    echo -e "${GREEN}✅ Production environment started!${NC}"
    echo -e "${BLUE}📱 Frontend: http://localhost:3000${NC}"
    echo -e "${BLUE}🔧 Backend API: http://localhost:8080${NC}"
    echo ""
    echo -e "${YELLOW}💡 Use 'docker logs -f presensi-frontend-1' to see frontend logs${NC}"
    echo -e "${YELLOW}💡 Use 'docker logs -f presensi-backend-1' to see backend logs${NC}"
}

# Function to build images
build_images() {
    echo -e "${YELLOW}🔨 Building Docker images...${NC}"
    docker-compose build --no-cache
    docker-compose -f docker-compose.dev.yml build --no-cache
    echo -e "${GREEN}✅ All images built successfully!${NC}"
}

# Function to stop containers
stop_containers() {
    echo -e "${YELLOW}🛑 Stopping all containers...${NC}"
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    echo -e "${GREEN}✅ All containers stopped!${NC}"
}

# Function to clean up
clean_up() {
    echo -e "${YELLOW}🧹 Cleaning up containers and images...${NC}"
    docker-compose down --rmi all --volumes --remove-orphans
    docker-compose -f docker-compose.dev.yml down --rmi all --volumes --remove-orphans
    echo -e "${GREEN}✅ Cleanup completed!${NC}"
}

# Function to show logs
show_logs() {
    echo -e "${YELLOW}📋 Showing logs from all services...${NC}"
    echo -e "${BLUE}Press Ctrl+C to stop viewing logs${NC}"
    docker-compose logs -f
}

# Main script logic
check_docker

case "${1:-help}" in
    "dev")
        start_dev
        ;;
    "prod")
        start_prod
        ;;
    "build")
        build_images
        ;;
    "stop")
        stop_containers
        ;;
    "clean")
        clean_up
        ;;
    "logs")
        show_logs
        ;;
    "help"|*)
        show_usage
        ;;
esac