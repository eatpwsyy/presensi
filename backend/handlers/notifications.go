package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

func getAllowedOrigins() []string {
	return []string{
		"http://localhost:3000",
		"http://localhost:3001", 
		"http://127.0.0.1:3000",
		"http://127.0.0.1:3001",
	}
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		allowedOrigins := getAllowedOrigins()
		origin := r.Header.Get("Origin")
		for _, allowedOrigin := range allowedOrigins {
			if origin == allowedOrigin {
				return true
			}
		}
		return false
	},
}

type NotificationHub struct {
	clients    map[*websocket.Conn]bool
	broadcast  chan []byte
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
}

type Notification struct {
	ID        int       `json:"id"`
	Type      string    `json:"type"`
	Title     string    `json:"title"`
	Message   string    `json:"message"`
	UserID    int       `json:"user_id"`
	UserType  string    `json:"user_type"` // "student", "admin", "parent"
	Priority  string    `json:"priority"`  // "low", "medium", "high"
	Read      bool      `json:"read"`
	CreatedAt time.Time `json:"created_at"`
}

var hub = NotificationHub{
	clients:    make(map[*websocket.Conn]bool),
	broadcast:  make(chan []byte),
	register:   make(chan *websocket.Conn),
	unregister: make(chan *websocket.Conn),
}

func init() {
	go hub.run()
}

func (h *NotificationHub) run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
			log.Println("Client connected to WebSocket")

		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				client.Close()
				log.Println("Client disconnected from WebSocket")
			}

		case message := <-h.broadcast:
			for client := range h.clients {
				err := client.WriteMessage(websocket.TextMessage, message)
				if err != nil {
					log.Printf("Error sending message: %v", err)
					client.Close()
					delete(h.clients, client)
				}
			}
		}
	}
}

func HandleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade to WebSocket: %v", err)
		return
	}

	hub.register <- conn

	defer func() {
		hub.unregister <- conn
	}()

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			log.Printf("WebSocket read error: %v", err)
			break
		}
	}
}

func BroadcastNotification(notification Notification) {
	message, err := json.Marshal(notification)
	if err != nil {
		log.Printf("Error marshaling notification: %v", err)
		return
	}

	hub.broadcast <- message
}

func SendAttendanceNotification(studentName string, status string, checkTime time.Time) {
	notification := Notification{
		Type:      "attendance",
		Title:     "Presensi Update",
		Message:   studentName + " telah " + status + " pada " + checkTime.Format("15:04"),
		Priority:  "medium",
		CreatedAt: time.Now(),
	}

	BroadcastNotification(notification)
}

func SendParentNotification(studentID int, studentName string, message string) {
	notification := Notification{
		Type:      "parent_alert",
		Title:     "Notifikasi Siswa",
		Message:   "Siswa " + studentName + ": " + message,
		UserID:    studentID,
		UserType:  "parent",
		Priority:  "high",
		CreatedAt: time.Now(),
	}

	BroadcastNotification(notification)
}