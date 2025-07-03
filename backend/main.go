package main

import (
	"log"
	"school-attendance/database"
	"school-attendance/handlers"
	"school-attendance/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize database
	database.InitDatabase()

	// Create Gin router
	r := gin.Default()

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:3001"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// API routes
	api := r.Group("/api")
	{
		// Public routes
		auth := api.Group("/auth")
		{
			auth.POST("/student/login", handlers.StudentLogin)
			auth.POST("/student/register", handlers.StudentRegister)
			auth.POST("/admin/login", handlers.AdminLogin)
		}

		// Protected routes - Student
		student := api.Group("/student")
		student.Use(middleware.AuthMiddleware("student"))
		{
			student.GET("/profile", handlers.GetProfile)
			student.POST("/checkin", handlers.CheckIn)
			student.POST("/checkout", handlers.CheckOut)
			student.GET("/attendance", handlers.GetMyAttendance)
		}

		// Protected routes - Admin
		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware("admin"))
		{
			admin.GET("/profile", handlers.GetProfile)
			
			// Student management
			admin.GET("/students", handlers.GetAllStudents)
			admin.GET("/students/:id", handlers.GetStudent)
			admin.POST("/students", handlers.CreateStudent)
			admin.PUT("/students/:id", handlers.UpdateStudent)
			admin.DELETE("/students/:id", handlers.DeleteStudent)
			admin.GET("/students/class/:class", handlers.GetStudentsByClass)
			admin.GET("/students/grade/:grade", handlers.GetStudentsByGrade)
			
			// Attendance management
			admin.GET("/attendance", handlers.GetAllAttendance)
			admin.POST("/attendance", handlers.CreateAttendance)
			admin.PUT("/attendance/:id", handlers.UpdateAttendance)
			admin.GET("/attendance/stats", handlers.GetAttendanceStats)
		}

		// Protected routes - Both student and admin
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware(""))
		{
			protected.GET("/profile", handlers.GetProfile)
		}
	}

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
			"message": "School Attendance System API is running",
		})
	})

	// Start server
	log.Println("Server starting on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}