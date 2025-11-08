package entities

import "time"

type Message struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Username  string    `json:"username"`
	Content   string    `json:"content"`
	RoomID    string    `json:"room_id"`
	Timestamp time.Time `json:"timestamp"`
}
