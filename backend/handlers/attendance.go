package handlers

import (
	"net/http"
	"school-attendance/database"
	"school-attendance/models"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AttendanceRequest struct {
	StudentID uint   `json:"student_id"`
	Date      string `json:"date"` // YYYY-MM-DD format
	Status    string `json:"status"`
	Notes     string `json:"notes"`
	Subject   string `json:"subject"`
}

type CheckInRequest struct {
	Subject string `json:"subject"`
}

func CheckIn(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	studentID := userID.(uint)
	var req CheckInRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	today := time.Now().Format("2006-01-02")
	todayTime, _ := time.Parse("2006-01-02", today)

	// Check if already checked in today
	var existingAttendance models.Attendance
	err := database.DB.Where("student_id = ? AND date = ?", studentID, todayTime).First(&existingAttendance).Error
	
	if err == nil {
		// Update existing record
		now := time.Now()
		existingAttendance.CheckInTime = &now
		existingAttendance.Status = models.StatusPresent
		existingAttendance.Subject = req.Subject
		
		if err := database.DB.Save(&existingAttendance).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update attendance"})
			return
		}
		
		c.JSON(http.StatusOK, gin.H{
			"message": "Check-in successful",
			"attendance": existingAttendance,
		})
		return
	}

	// Create new attendance record
	now := time.Now()
	attendance := models.Attendance{
		StudentID:   studentID,
		Date:        todayTime,
		CheckInTime: &now,
		Status:      models.StatusPresent,
		Subject:     req.Subject,
	}

	if err := database.DB.Create(&attendance).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create attendance record"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Check-in successful",
		"attendance": attendance,
	})
}

func CheckOut(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	studentID := userID.(uint)
	today := time.Now().Format("2006-01-02")
	todayTime, _ := time.Parse("2006-01-02", today)

	var attendance models.Attendance
	if err := database.DB.Where("student_id = ? AND date = ?", studentID, todayTime).First(&attendance).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "No check-in record found for today"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	now := time.Now()
	attendance.CheckOutTime = &now

	if err := database.DB.Save(&attendance).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update attendance"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Check-out successful",
		"attendance": attendance,
	})
}

func GetMyAttendance(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	studentID := userID.(uint)
	
	// Get query parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	month := c.Query("month") // YYYY-MM format
	
	offset := (page - 1) * limit

	query := database.DB.Where("student_id = ?", studentID)
	
	if month != "" {
		startDate := month + "-01"
		parsedMonth, err := time.Parse("2006-01", month)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid month format"})
			return
		}
		lastDay := parsedMonth.AddDate(0, 1, -1).Format("2006-01-02")
		query = query.Where("date >= ? AND date <= ?", startDate, lastDay)
	}

	var attendances []models.Attendance
	var total int64

	query.Model(&models.Attendance{}).Count(&total)
	
	if err := query.Offset(offset).Limit(limit).Order("date DESC").Find(&attendances).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch attendance records"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"attendances": attendances,
		"total": total,
		"page": page,
		"limit": limit,
	})
}

func CreateAttendance(c *gin.Context) {
	var req AttendanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse date
	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
		return
	}

	// Check if attendance already exists for this student and date
	var existingAttendance models.Attendance
	err = database.DB.Where("student_id = ? AND date = ?", req.StudentID, date).First(&existingAttendance).Error
	
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Attendance record already exists for this date"})
		return
	}

	attendance := models.Attendance{
		StudentID: req.StudentID,
		Date:      date,
		Status:    req.Status,
		Notes:     req.Notes,
		Subject:   req.Subject,
	}

	if err := database.DB.Create(&attendance).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create attendance record"})
		return
	}

	// Load student information
	database.DB.Preload("Student").First(&attendance, attendance.ID)

	c.JSON(http.StatusCreated, attendance)
}

func UpdateAttendance(c *gin.Context) {
	id := c.Param("id")
	attendanceID, err := strconv.ParseUint(id, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid attendance ID"})
		return
	}

	var req AttendanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var attendance models.Attendance
	if err := database.DB.First(&attendance, attendanceID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Attendance record not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Update fields
	if req.Status != "" {
		attendance.Status = req.Status
	}
	if req.Notes != "" {
		attendance.Notes = req.Notes
	}
	if req.Subject != "" {
		attendance.Subject = req.Subject
	}

	if err := database.DB.Save(&attendance).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update attendance"})
		return
	}

	// Load student information
	database.DB.Preload("Student").First(&attendance, attendance.ID)

	c.JSON(http.StatusOK, attendance)
}

func GetAllAttendance(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	class := c.Query("class")
	grade := c.Query("grade")
	date := c.Query("date")
	status := c.Query("status")
	
	offset := (page - 1) * limit

	query := database.DB.Preload("Student")
	
	if class != "" {
		query = query.Joins("JOIN students ON attendances.student_id = students.id").Where("students.class = ?", class)
	}
	if grade != "" {
		query = query.Joins("JOIN students ON attendances.student_id = students.id").Where("students.grade = ?", grade)
	}
	if date != "" {
		query = query.Where("date = ?", date)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	var attendances []models.Attendance
	var total int64

	query.Model(&models.Attendance{}).Count(&total)
	
	if err := query.Offset(offset).Limit(limit).Order("date DESC, id DESC").Find(&attendances).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch attendance records"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"attendances": attendances,
		"total": total,
		"page": page,
		"limit": limit,
	})
}

func GetAttendanceStats(c *gin.Context) {
	studentIDParam := c.Query("student_id")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	query := `
		SELECT 
			s.id as student_id,
			s.name as student_name,
			COUNT(a.id) as total_days,
			COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_days,
			COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_days,
			COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_days,
			ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0) / 
				  NULLIF(COUNT(a.id), 0), 2) as attendance_rate
		FROM students s
		LEFT JOIN attendances a ON s.id = a.student_id
	`

	var args []interface{}
	var whereConditions []string

	if studentIDParam != "" {
		whereConditions = append(whereConditions, "s.id = ?")
		args = append(args, studentIDParam)
	}

	if startDate != "" && endDate != "" {
		whereConditions = append(whereConditions, "a.date BETWEEN ? AND ?")
		args = append(args, startDate, endDate)
	}

	if len(whereConditions) > 0 {
		query += " WHERE " + whereConditions[0]
		for i := 1; i < len(whereConditions); i++ {
			query += " AND " + whereConditions[i]
		}
	}

	query += " GROUP BY s.id, s.name ORDER BY s.name"

	var stats []models.AttendanceStats
	if err := database.DB.Raw(query, args...).Scan(&stats).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch attendance statistics"})
		return
	}

	c.JSON(http.StatusOK, stats)
}