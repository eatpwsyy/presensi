package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
	"school-attendance/database"
	"school-attendance/models"

	"github.com/gin-gonic/gin"
	"github.com/skip2/go-qrcode"
)

func generateSessionCode() string {
	bytes := make([]byte, 16)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

func GenerateQRCode(c *gin.Context) {
	var request struct {
		Subject  string `json:"subject" binding:"required"`
		Teacher  string `json:"teacher" binding:"required"`
		Location string `json:"location" binding:"required"`
		Duration int    `json:"duration"` // Duration in minutes, default 30
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	duration := request.Duration
	if duration == 0 {
		duration = 30 // Default 30 minutes
	}

	sessionCode := generateSessionCode()
	expiresAt := time.Now().Add(time.Duration(duration) * time.Minute)

	qrSession := models.QRSession{
		SessionCode: sessionCode,
		Subject:     request.Subject,
		Teacher:     request.Teacher,
		Location:    request.Location,
		ExpiresAt:   expiresAt,
		IsActive:    true,
	}

	db := database.GetDB()
	if err := db.Create(&qrSession).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create QR session"})
		return
	}

	// Create QR code data
	qrData := map[string]interface{}{
		"session_code": sessionCode,
		"subject":      request.Subject,
		"teacher":      request.Teacher,
		"location":     request.Location,
		"expires_at":   expiresAt.Unix(),
	}

	qrDataJSON, _ := json.Marshal(qrData)

	// Generate QR code
	qrCode, err := qrcode.Encode(string(qrDataJSON), qrcode.Medium, 256)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate QR code"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"session_code": sessionCode,
		"qr_code":      qrCode,
		"expires_at":   expiresAt,
		"subject":      request.Subject,
		"teacher":      request.Teacher,
		"location":     request.Location,
	})
}

func ScanQRCode(c *gin.Context) {
	var request struct {
		QRData    string `json:"qr_data" binding:"required"`
		StudentID string `json:"student_id" binding:"required"`
		Location  string `json:"location"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse QR data
	var qrData map[string]interface{}
	if err := json.Unmarshal([]byte(request.QRData), &qrData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid QR code data"})
		return
	}

	sessionCode, ok := qrData["session_code"].(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session code in QR data"})
		return
	}

	expiresAtFloat, ok := qrData["expires_at"].(float64)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid expiration time in QR data"})
		return
	}

	expiresAt := time.Unix(int64(expiresAtFloat), 0)
	if time.Now().After(expiresAt) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "QR code has expired"})
		return
	}

	db := database.GetDB()

	// Check if QR session exists and is active
	var qrSession models.QRSession
	if err := db.Where("session_code = ? AND is_active = ?", sessionCode, true).First(&qrSession).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "QR session not found or inactive"})
		return
	}

	// Find student by student_id
	var student models.Student
	if err := db.Where("student_id = ?", request.StudentID).First(&student).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
		return
	}

	// Check if student already scanned this QR code
	var existingAttendance models.QRAttendance
	if err := db.Where("qr_session_id = ? AND student_id = ?", qrSession.ID, student.ID).First(&existingAttendance).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Student already marked attendance for this session"})
		return
	}

	// Create attendance record  
	qrAttendance := models.QRAttendance{
		StudentID:   student.ID,
		QRSessionID: qrSession.ID,
		ScanTime:    time.Now(),
		Location:    request.Location,
	}

	if err := db.Create(&qrAttendance).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record attendance"})
		return
	}

	// Send real-time notification
	SendAttendanceNotification(student.Name, "hadir via QR Code", time.Now())

	// Send parent notification
	SendParentNotification(int(student.ID), student.Name, 
		fmt.Sprintf("hadir di %s pada %s", qrSession.Subject, time.Now().Format("15:04")))

	c.JSON(http.StatusOK, gin.H{
		"message":      "Attendance recorded successfully",
		"student_name": student.Name,
		"subject":      qrSession.Subject,
		"teacher":      qrSession.Teacher,
		"scan_time":    qrAttendance.ScanTime,
	})
}

func GetQRSessions(c *gin.Context) {
	db := database.GetDB()

	var sessions []models.QRSession
	if err := db.Where("is_active = ?", true).Order("created_at DESC").Find(&sessions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch QR sessions"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"sessions": sessions})
}

func DeactivateQRSession(c *gin.Context) {
	sessionCode := c.Param("session_code")
	db := database.GetDB()

	if err := db.Model(&models.QRSession{}).Where("session_code = ?", sessionCode).Update("is_active", false).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to deactivate QR session"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "QR session deactivated successfully"})
}

func GetQRAttendanceReport(c *gin.Context) {
	sessionCode := c.Param("session_code")
	db := database.GetDB()

	var attendances []struct {
		models.QRAttendance
		StudentName string `json:"student_name"`
		Class       string `json:"class"`
		Grade       string `json:"grade"`
	}

	query := `
		SELECT qa.*, s.name as student_name, s.class, s.grade 
		FROM qr_attendances qa 
		JOIN students s ON qa.student_id = s.id 
		JOIN qr_sessions qs ON qa.qr_session_id = qs.id
		WHERE qs.session_code = ? 
		ORDER BY qa.scan_time ASC
	`

	if err := db.Raw(query, sessionCode).Scan(&attendances).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch attendance report"})
		return
	}

	// Get session information
	var session models.QRSession
	if err := db.Where("session_code = ?", sessionCode).First(&session).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"session":     session,
		"attendances": attendances,
		"total_count": len(attendances),
	})
}