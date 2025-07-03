package models

import (
	"time"
	"gorm.io/gorm"
)

type Student struct {
	ID          uint   `json:"id" gorm:"primaryKey"`
	StudentID   string `json:"student_id" gorm:"unique;not null"`
	Name        string `json:"name" gorm:"not null"`
	Email       string `json:"email" gorm:"unique;not null"`
	Password    string `json:"-" gorm:"not null"`
	Class       string `json:"class" gorm:"not null"`
	Grade       string `json:"grade" gorm:"not null"`
	PhoneNumber string `json:"phone_number"`
	Address     string `json:"address"`
	IsActive    bool   `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
	
	// Relationships
	Attendances []Attendance `json:"attendances,omitempty" gorm:"foreignKey:StudentID"`
}

type Admin struct {
	ID        uint   `json:"id" gorm:"primaryKey"`
	Username  string `json:"username" gorm:"unique;not null"`
	Email     string `json:"email" gorm:"unique;not null"`
	Password  string `json:"-" gorm:"not null"`
	Name      string `json:"name" gorm:"not null"`
	Role      string `json:"role" gorm:"default:admin"`
	IsActive  bool   `json:"is_active" gorm:"default:true"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}