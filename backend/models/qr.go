package models

import (
	"time"
)

type QRSession struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	SessionCode string    `json:"session_code" gorm:"unique;not null"`
	Subject     string    `json:"subject"`
	Teacher     string    `json:"teacher"`
	Location    string    `json:"location"`
	ExpiresAt   time.Time `json:"expires_at"`
	IsActive    bool      `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type QRAttendance struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	StudentID   uint      `json:"student_id" gorm:"not null"`
	QRSessionID uint      `json:"qr_session_id" gorm:"not null"`
	ScanTime    time.Time `json:"scan_time"`
	Location    string    `json:"location"`
	CreatedAt   time.Time `json:"created_at"`
	
	// Relationships
	Student   Student   `json:"student" gorm:"foreignKey:StudentID"`
	QRSession QRSession `json:"qr_session" gorm:"foreignKey:QRSessionID"`
}