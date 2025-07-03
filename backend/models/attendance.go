package models

import (
	"time"
	"gorm.io/gorm"
)

type Attendance struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	StudentID   uint      `json:"student_id" gorm:"not null"`
	Date        time.Time `json:"date" gorm:"not null"`
	CheckInTime *time.Time `json:"check_in_time"`
	CheckOutTime *time.Time `json:"check_out_time"`
	Status      string    `json:"status" gorm:"not null;default:absent"` // present, absent, late, excused
	Notes       string    `json:"notes"`
	Subject     string    `json:"subject"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
	
	// Relationships
	Student Student `json:"student,omitempty" gorm:"foreignKey:StudentID"`
}

type AttendanceStats struct {
	StudentID      uint    `json:"student_id"`
	StudentName    string  `json:"student_name"`
	TotalDays      int64   `json:"total_days"`
	PresentDays    int64   `json:"present_days"`
	AbsentDays     int64   `json:"absent_days"`
	LateDays       int64   `json:"late_days"`
	AttendanceRate float64 `json:"attendance_rate"`
}

// Status constants
const (
	StatusPresent = "present"
	StatusAbsent  = "absent"
	StatusLate    = "late"
	StatusExcused = "excused"
)