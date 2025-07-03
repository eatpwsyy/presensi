package database

import (
	"fmt"
	"log"
	"school-attendance/handlers"
	"school-attendance/models"
	"time"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"golang.org/x/crypto/bcrypt"
)

var DB *gorm.DB

func InitDatabase() {
	var err error
	DB, err = gorm.Open(sqlite.Open("school_attendance.db"), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto migrate the schema
	err = DB.AutoMigrate(
		&models.Student{},
		&models.Admin{},
		&models.Attendance{},
		&handlers.QRSession{},
		&models.QRAttendance{},
		&models.Parent{},
		&models.StudentParent{},
		&models.Notification{},
	)
	
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Create default admin user
	createDefaultAdmin()
	
	fmt.Println("Database connected and migrated successfully")
}

func createDefaultAdmin() {
	var admin models.Admin
	result := DB.Where("username = ?", "admin").First(&admin)
	
	if result.Error == gorm.ErrRecordNotFound {
		// Hash password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("Error hashing password: %v", err)
			return
		}

		defaultAdmin := models.Admin{
			Username: "admin",
			Email:    "admin@school.com",
			Password: string(hashedPassword),
			Name:     "System Administrator",
			Role:     "admin",
			IsActive: true,
		}

		if err := DB.Create(&defaultAdmin).Error; err != nil {
			log.Printf("Error creating default admin: %v", err)
		} else {
			fmt.Println("Default admin created - Username: admin, Password: admin123")
		}
	}
}

func GetDB() *gorm.DB {
	return DB
}