package models

import (
	"time"
)

type Reminder struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	RemindAt  time.Time `json:"remind_at"`
	CreatedAt time.Time `json:"created_at"`
}

// Guys funny story: I was tired of so much typization in Golang so I became TypeScript dev
// NOW I WRITE SAME TYPES IN DIFFERENT LANGUAGE DAWG WHY AM I SO RETARDED

type ReminderRequest struct {
	Title    string `json:"title"`
	Content  string `json:"content"`
	RemindAt string `json:"remind_at"` // Format: "2006-01-02T15:04:05Z"
}

type PendingReminder struct {
	UserID   int    `json:"user_id"`
	Title    string `json:"title"`
	Content  string `json:"content"`
	RemindAt string `json:"remind_at"`
	Filename string `json:"filename"`
}
