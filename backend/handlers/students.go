package handlers

import (
	"net/http"
	"school-attendance/database"
	"school-attendance/models"
	"strconv"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func GetAllStudents(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	class := c.Query("class")
	grade := c.Query("grade")
	search := c.Query("search")
	
	offset := (page - 1) * limit

	query := database.DB.Model(&models.Student{})
	
	if class != "" {
		query = query.Where("class = ?", class)
	}
	if grade != "" {
		query = query.Where("grade = ?", grade)
	}
	if search != "" {
		query = query.Where("name LIKE ? OR student_id LIKE ? OR email LIKE ?", 
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	var students []models.Student
	var total int64

	query.Count(&total)
	
	if err := query.Offset(offset).Limit(limit).Order("name").Find(&students).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch students"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"students": students,
		"total": total,
		"page": page,
		"limit": limit,
	})
}

func GetStudent(c *gin.Context) {
	id := c.Param("id")
	studentID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid student ID"})
		return
	}

	var student models.Student
	if err := database.DB.Preload("Attendances").First(&student, studentID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, student)
}

func CreateStudent(c *gin.Context) {
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

	c.JSON(http.StatusCreated, student)
}

func UpdateStudent(c *gin.Context) {
	id := c.Param("id")
	studentID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid student ID"})
		return
	}

	var student models.Student
	if err := database.DB.First(&student, studentID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	type UpdateStudentRequest struct {
		Name        string `json:"name"`
		Email       string `json:"email"`
		Class       string `json:"class"`
		Grade       string `json:"grade"`
		PhoneNumber string `json:"phone_number"`
		Address     string `json:"address"`
		IsActive    *bool  `json:"is_active"`
		Password    string `json:"password"`
	}

	var req UpdateStudentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if email is being changed and if it already exists
	if req.Email != "" && req.Email != student.Email {
		var existingStudent models.Student
		if err := database.DB.Where("email = ? AND id != ?", req.Email, studentID).First(&existingStudent).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
			return
		}
		student.Email = req.Email
	}

	// Update fields
	if req.Name != "" {
		student.Name = req.Name
	}
	if req.Class != "" {
		student.Class = req.Class
	}
	if req.Grade != "" {
		student.Grade = req.Grade
	}
	if req.PhoneNumber != "" {
		student.PhoneNumber = req.PhoneNumber
	}
	if req.Address != "" {
		student.Address = req.Address
	}
	if req.IsActive != nil {
		student.IsActive = *req.IsActive
	}
	if req.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}
		student.Password = string(hashedPassword)
	}

	if err := database.DB.Save(&student).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update student"})
		return
	}

	c.JSON(http.StatusOK, student)
}

func DeleteStudent(c *gin.Context) {
	id := c.Param("id")
	studentID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid student ID"})
		return
	}

	var student models.Student
	if err := database.DB.First(&student, studentID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Soft delete
	if err := database.DB.Delete(&student).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete student"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Student deleted successfully"})
}

func GetStudentsByClass(c *gin.Context) {
	class := c.Param("class")
	
	var students []models.Student
	if err := database.DB.Where("class = ? AND is_active = ?", class, true).Order("name").Find(&students).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch students"})
		return
	}

	c.JSON(http.StatusOK, students)
}

func GetStudentsByGrade(c *gin.Context) {
	grade := c.Param("grade")
	
	var students []models.Student
	if err := database.DB.Where("grade = ? AND is_active = ?", grade, true).Order("class, name").Find(&students).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch students"})
		return
	}

	c.JSON(http.StatusOK, students)
}