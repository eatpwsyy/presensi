package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jung-kurt/gofpdf"
	"github.com/tealeg/xlsx/v3"
	"gorm.io/gorm"
)

type AttendanceReport struct {
	StudentID   string    `json:"student_id"`
	StudentName string    `json:"student_name"`
	Class       string    `json:"class"`
	Grade       string    `json:"grade"`
	Date        time.Time `json:"date"`
	CheckIn     string    `json:"check_in"`
	CheckOut    string    `json:"check_out"`
	Status      string    `json:"status"`
	Subject     string    `json:"subject"`
	Notes       string    `json:"notes"`
}

func ExportAttendanceToPDF(c *gin.Context) {
	// Get query parameters
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")
	class := c.Query("class")
	grade := c.Query("grade")

	db := c.MustGet("db").(*gorm.DB)

	// Build query
	query := `
		SELECT 
			s.student_id,
			s.name as student_name,
			s.class,
			s.grade,
			a.date,
			a.check_in_time as check_in,
			a.check_out_time as check_out,
			a.status,
			a.subject,
			a.notes
		FROM students s
		LEFT JOIN attendances a ON s.student_id = a.student_id
		WHERE 1=1
	`

	args := []interface{}{}

	if startDate != "" {
		query += " AND a.date >= ?"
		args = append(args, startDate)
	}
	if endDate != "" {
		query += " AND a.date <= ?"
		args = append(args, endDate)
	}
	if class != "" {
		query += " AND s.class = ?"
		args = append(args, class)
	}
	if grade != "" {
		query += " AND s.grade = ?"
		args = append(args, grade)
	}

	query += " ORDER BY s.class, s.name, a.date"

	var reports []AttendanceReport
	if err := db.Raw(query, args...).Scan(&reports).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch attendance data"})
		return
	}

	// Create PDF
	pdf := gofpdf.New("L", "mm", "A4", "")
	pdf.AddPage()

	// Set font
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(0, 10, "Laporan Presensi Siswa")
	pdf.Ln(15)

	// Add filter information
	pdf.SetFont("Arial", "", 10)
	if startDate != "" && endDate != "" {
		pdf.Cell(0, 5, fmt.Sprintf("Periode: %s - %s", startDate, endDate))
		pdf.Ln(5)
	}
	if class != "" {
		pdf.Cell(0, 5, fmt.Sprintf("Kelas: %s", class))
		pdf.Ln(5)
	}
	if grade != "" {
		pdf.Cell(0, 5, fmt.Sprintf("Tingkat: %s", grade))
		pdf.Ln(5)
	}
	pdf.Ln(5)

	// Table headers
	pdf.SetFont("Arial", "B", 8)
	pdf.Cell(25, 8, "ID Siswa")
	pdf.Cell(40, 8, "Nama")
	pdf.Cell(15, 8, "Kelas")
	pdf.Cell(20, 8, "Tanggal")
	pdf.Cell(20, 8, "Masuk")
	pdf.Cell(20, 8, "Keluar")
	pdf.Cell(20, 8, "Status")
	pdf.Cell(30, 8, "Mata Pelajaran")
	pdf.Cell(30, 8, "Catatan")
	pdf.Ln(8)

	// Table data
	pdf.SetFont("Arial", "", 7)
	for _, report := range reports {
		checkIn := ""
		checkOut := ""
		if report.CheckIn != "" {
			if t, err := time.Parse("15:04:05", report.CheckIn); err == nil {
				checkIn = t.Format("15:04")
			}
		}
		if report.CheckOut != "" {
			if t, err := time.Parse("15:04:05", report.CheckOut); err == nil {
				checkOut = t.Format("15:04")
			}
		}

		pdf.Cell(25, 6, report.StudentID)
		pdf.Cell(40, 6, report.StudentName)
		pdf.Cell(15, 6, report.Class)
		pdf.Cell(20, 6, report.Date.Format("02/01/2006"))
		pdf.Cell(20, 6, checkIn)
		pdf.Cell(20, 6, checkOut)
		pdf.Cell(20, 6, report.Status)
		pdf.Cell(30, 6, report.Subject)
		pdf.Cell(30, 6, report.Notes)
		pdf.Ln(6)
	}

	// Add footer
	pdf.Ln(10)
	pdf.SetFont("Arial", "I", 8)
	pdf.Cell(0, 5, fmt.Sprintf("Dicetak pada: %s", time.Now().Format("02/01/2006 15:04")))

	// Output PDF
	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=laporan_presensi_%s.pdf", time.Now().Format("20060102")))

	if err := pdf.Output(c.Writer); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate PDF"})
		return
	}
}

func ExportAttendanceToExcel(c *gin.Context) {
	// Get query parameters
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")
	class := c.Query("class")
	grade := c.Query("grade")

	db := c.MustGet("db").(*gorm.DB)

	// Build query (same as PDF)
	query := `
		SELECT 
			s.student_id,
			s.name as student_name,
			s.class,
			s.grade,
			a.date,
			a.check_in_time as check_in,
			a.check_out_time as check_out,
			a.status,
			a.subject,
			a.notes
		FROM students s
		LEFT JOIN attendances a ON s.student_id = a.student_id
		WHERE 1=1
	`

	args := []interface{}{}

	if startDate != "" {
		query += " AND a.date >= ?"
		args = append(args, startDate)
	}
	if endDate != "" {
		query += " AND a.date <= ?"
		args = append(args, endDate)
	}
	if class != "" {
		query += " AND s.class = ?"
		args = append(args, class)
	}
	if grade != "" {
		query += " AND s.grade = ?"
		args = append(args, grade)
	}

	query += " ORDER BY s.class, s.name, a.date"

	var reports []AttendanceReport
	if err := db.Raw(query, args...).Scan(&reports).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch attendance data"})
		return
	}

	// Create Excel file
	file := xlsx.NewFile()
	sheet, err := file.AddSheet("Laporan Presensi")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create Excel sheet"})
		return
	}

	// Add title
	titleRow := sheet.AddRow()
	titleCell := titleRow.AddCell()
	titleCell.Value = "LAPORAN PRESENSI SISWA"
	titleStyle := xlsx.NewStyle()
	titleStyle.Font.Bold = true
	titleStyle.Font.Size = 16
	titleCell.SetStyle(titleStyle)

	// Add filter info
	if startDate != "" && endDate != "" {
		filterRow := sheet.AddRow()
		filterCell := filterRow.AddCell()
		filterCell.Value = fmt.Sprintf("Periode: %s - %s", startDate, endDate)
	}

	// Add empty row
	sheet.AddRow()

	// Add headers
	headerRow := sheet.AddRow()
	headers := []string{"ID Siswa", "Nama", "Kelas", "Tingkat", "Tanggal", "Jam Masuk", "Jam Keluar", "Status", "Mata Pelajaran", "Catatan"}
	
	headerStyle := xlsx.NewStyle()
	headerStyle.Font.Bold = true
	headerStyle.Fill.PatternType = "solid"
	headerStyle.Fill.FgColor = "CCCCCC"

	for _, header := range headers {
		cell := headerRow.AddCell()
		cell.Value = header
		cell.SetStyle(headerStyle)
	}

	// Add data
	for _, report := range reports {
		row := sheet.AddRow()
		
		// ID Siswa
		cell := row.AddCell()
		cell.Value = report.StudentID
		
		// Nama
		cell = row.AddCell()
		cell.Value = report.StudentName
		
		// Kelas
		cell = row.AddCell()
		cell.Value = report.Class
		
		// Tingkat
		cell = row.AddCell()
		cell.Value = report.Grade
		
		// Tanggal
		cell = row.AddCell()
		cell.Value = report.Date.Format("02/01/2006")
		
		// Jam Masuk
		cell = row.AddCell()
		if report.CheckIn != "" {
			if t, err := time.Parse("15:04:05", report.CheckIn); err == nil {
				cell.Value = t.Format("15:04")
			}
		}
		
		// Jam Keluar
		cell = row.AddCell()
		if report.CheckOut != "" {
			if t, err := time.Parse("15:04:05", report.CheckOut); err == nil {
				cell.Value = t.Format("15:04")
			}
		}
		
		// Status
		cell = row.AddCell()
		cell.Value = report.Status
		
		// Mata Pelajaran
		cell = row.AddCell()
		cell.Value = report.Subject
		
		// Catatan
		cell = row.AddCell()
		cell.Value = report.Notes
	}

	// Auto-resize columns
	for i := 0; i < len(headers); i++ {
		sheet.Col(i).Width = 15
	}

	// Add footer
	footerRow := sheet.AddRow()
	footerRow.AddRow() // Empty row
	footerCell := footerRow.AddCell()
	footerCell.Value = fmt.Sprintf("Dicetak pada: %s", time.Now().Format("02/01/2006 15:04"))

	// Output Excel
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=laporan_presensi_%s.xlsx", time.Now().Format("20060102")))

	if err := file.Write(c.Writer); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate Excel file"})
		return
	}
}

func GetAttendanceStats(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)

	// Get query parameters
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")
	class := c.Query("class")
	grade := c.Query("grade")

	// Build base query
	baseQuery := "FROM attendances a JOIN students s ON a.student_id = s.student_id WHERE 1=1"
	args := []interface{}{}

	if startDate != "" {
		baseQuery += " AND a.date >= ?"
		args = append(args, startDate)
	}
	if endDate != "" {
		baseQuery += " AND a.date <= ?"
		args = append(args, endDate)
	}
	if class != "" {
		baseQuery += " AND s.class = ?"
		args = append(args, class)
	}
	if grade != "" {
		baseQuery += " AND s.grade = ?"
		args = append(args, grade)
	}

	// Get overall stats
	var totalStudents, presentCount, absentCount, lateCount, excusedCount int64

	// Total students
	studentQuery := "SELECT COUNT(DISTINCT s.student_id) " + baseQuery
	db.Raw(studentQuery, args...).Scan(&totalStudents)

	// Present count
	presentQuery := "SELECT COUNT(*) " + baseQuery + " AND a.status = 'present'"
	db.Raw(presentQuery, args...).Scan(&presentCount)

	// Absent count
	absentQuery := "SELECT COUNT(*) " + baseQuery + " AND a.status = 'absent'"
	db.Raw(absentQuery, args...).Scan(&absentCount)

	// Late count
	lateQuery := "SELECT COUNT(*) " + baseQuery + " AND a.status = 'late'"
	db.Raw(lateQuery, args...).Scan(&lateCount)

	// Excused count
	excusedQuery := "SELECT COUNT(*) " + baseQuery + " AND a.status = 'excused'"
	db.Raw(excusedQuery, args...).Scan(&excusedCount)

	// Get daily stats for the last 7 days
	dailyStatsQuery := `
		SELECT 
			a.date,
			COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present,
			COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent,
			COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late,
			COUNT(CASE WHEN a.status = 'excused' THEN 1 END) as excused
		` + baseQuery + `
		AND a.date >= DATE('now', '-7 days')
		GROUP BY a.date
		ORDER BY a.date
	`

	var dailyStats []map[string]interface{}
	db.Raw(dailyStatsQuery, args...).Scan(&dailyStats)

	// Get class-wise stats
	classStatsQuery := `
		SELECT 
			s.class,
			COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present,
			COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent,
			COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late,
			COUNT(CASE WHEN a.status = 'excused' THEN 1 END) as excused
		` + baseQuery + `
		GROUP BY s.class
		ORDER BY s.class
	`

	var classStats []map[string]interface{}
	db.Raw(classStatsQuery, args...).Scan(&classStats)

	c.JSON(http.StatusOK, gin.H{
		"overall": gin.H{
			"total_students": totalStudents,
			"present_count":  presentCount,
			"absent_count":   absentCount,
			"late_count":     lateCount,
			"excused_count":  excusedCount,
		},
		"daily_stats": dailyStats,
		"class_stats": classStats,
	})
}