package models

import (
	"time"
	"gorm.io/gorm"
)

type Parent struct {
	ID          uint   `json:"id" gorm:"primaryKey"`
	Name        string `json:"name" gorm:"not null"`
	Email       string `json:"email" gorm:"unique;not null"`
	PhoneNumber string `json:"phone_number"`
	Address     string `json:"address"`
	Relationship string `json:"relationship"` // father, mother, guardian
	IsActive    bool   `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
	
	// Relationships
	Students []StudentParent `json:"students,omitempty" gorm:"foreignKey:ParentID"`
}

type StudentParent struct {
	ID        uint   `json:"id" gorm:"primaryKey"`
	StudentID string `json:"student_id" gorm:"not null"`
	ParentID  uint   `json:"parent_id" gorm:"not null"`
	CreatedAt time.Time `json:"created_at"`
	
	// Foreign key relationships
	Student Student `json:"student" gorm:"foreignKey:StudentID;references:StudentID"`
	Parent  Parent  `json:"parent" gorm:"foreignKey:ParentID"`
}

type Notification struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Type      string    `json:"type" gorm:"not null"` // attendance, grade, announcement, etc.
	Title     string    `json:"title" gorm:"not null"`
	Message   string    `json:"message" gorm:"not null"`
	UserID    int       `json:"user_id"`
	UserType  string    `json:"user_type"` // student, admin, parent
	Priority  string    `json:"priority" gorm:"default:medium"` // low, medium, high
	Read      bool      `json:"read" gorm:"default:false"`
	SentEmail bool      `json:"sent_email" gorm:"default:false"`
	SentSMS   bool      `json:"sent_sms" gorm:"default:false"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}