package handlers

import (
	"net/http"
	"school-attendance/database"
	"school-attendance/middleware"
	"school-attendance/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type LoginRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type StudentRegisterRequest struct {
	StudentID   string `json:"student_id" binding:"required"`
	Name        string `json:"name" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=6"`
	Class       string `json:"class" binding:"required"`
	Grade       string `json:"grade" binding:"required"`
	PhoneNumber string `json:"phone_number"`
	Address     string `json:"address"`
}

type AuthResponse struct {
	Token string      `json:"token"`
	User  interface{} `json:"user"`
}

func StudentLogin(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var student models.Student
	if err := database.DB.Where("email = ? AND is_active = ?", req.Email, true).First(&student).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(student.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token, err := middleware.GenerateToken(student.ID, "student")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, AuthResponse{
		Token: token,
		User:  student,
	})
}

func AdminLogin(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var admin models.Admin
	if err := database.DB.Where("email = ? AND is_active = ?", req.Email, true).First(&admin).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token, err := middleware.GenerateToken(admin.ID, "admin")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, AuthResponse{
		Token: token,
		User:  admin,
	})
}

func StudentRegister(c *gin.Context) {
	var req StudentRegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if student ID or email already exists
	var existingStudent models.Student
	if err := database.DB.Where("student_id = ? OR email = ?", req.StudentID, req.Email).First(&existingStudent).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Student ID or email already exists"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	student := models.Student{
		StudentID:   req.StudentID,
		Name:        req.Name,
		Email:       req.Email,
		Password:    string(hashedPassword),
		Class:       req.Class,
		Grade:       req.Grade,
		PhoneNumber: req.PhoneNumber,
		Address:     req.Address,
		IsActive:    true,
	}

	if err := database.DB.Create(&student).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create student"})
		return
	}

	token, err := middleware.GenerateToken(student.ID, "student")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusCreated, AuthResponse{
		Token: token,
		User:  student,
	})
}

func GetProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userType, _ := c.Get("user_type")

	if userType == "student" {
		var student models.Student
		if err := database.DB.First(&student, userID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
			return
		}
		c.JSON(http.StatusOK, student)
	} else if userType == "admin" {
		var admin models.Admin
		if err := database.DB.First(&admin, userID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Admin not found"})
			return
		}
		c.JSON(http.StatusOK, admin)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user type"})
	}
}