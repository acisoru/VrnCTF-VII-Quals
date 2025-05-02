package cron

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/m41den/vrnctf_pre_hard/backend/models"
)

const REMINDERS_DIR = "./reminders"

// ProcessReminders checks for pending reminders and adds them to the database if it's time
func ProcessReminders() {
	log.Println("Processing reminders...")

	// Create reminders directory if it doesn't exist
	if _, err := os.Stat(REMINDERS_DIR); os.IsNotExist(err) {
		os.Mkdir(REMINDERS_DIR, 0755)
	}

	// Get all JSON files in the reminders directory
	files, err := os.ReadDir(REMINDERS_DIR)
	if err != nil {
		log.Printf("Error reading reminders directory: %v\n", err)
		return
	}

	// Frontend sends times in ISO8601, so we need to compare in UTC
	now := time.Now().UTC()

	for _, file := range files {
		if !strings.HasSuffix(file.Name(), ".json") {
			continue
		}

		filePath := filepath.Join(REMINDERS_DIR, file.Name())
		fileData, err := os.ReadFile(filePath)
		if err != nil {
			log.Printf("Error reading file %s: %v\n", file.Name(), err)
			continue
		}

		var reminder models.PendingReminder
		if err := json.Unmarshal(fileData, &reminder); err != nil {
			log.Printf("Error parsing reminder from %s: %v\n", file.Name(), err)
			continue
		}

		reminderTime, err := time.Parse(time.RFC3339, reminder.RemindAt)
		if err != nil {
			log.Printf("Invalid time format in %s: %v\n", file.Name(), err)
			continue
		}

		if reminderTime.Before(now) {
			log.Printf("Processing reminder: %s (scheduled for %s)\n", reminder.Title, reminderTime.Format(time.RFC3339))

			dbHost := os.Getenv("DB_HOST")
			if dbHost == "" {
				dbHost = "db"
			}

			dbPassword := os.Getenv("DB_PASSWORD")
			if dbPassword == "" {
				dbPassword = "postgres"
			}

			sqlCmd := fmt.Sprintf("INSERT INTO reminders (user_id, remind_at, content, title) VALUES (%d, '%s', '%s', '%s')",
				reminder.UserID,
				reminder.RemindAt,
				reminder.Content,
				reminder.Title,
			)

			log.Printf("Executing SQL command: %s\n", sqlCmd)

			cmd := exec.Command("psql",
				"-h", dbHost,
				"-U", "postgres",
				"-d", "reminders",
				"-c", sqlCmd)

			cmd.Env = append(os.Environ(), fmt.Sprintf("PGPASSWORD=%s", dbPassword))
			output, err := cmd.CombinedOutput()
			if err != nil {
				log.Printf("Error executing SQL command: %v\nOutput: %s\n", err, string(output))
				// Delete the file even when there's an SQL error to prevent repeated processing
				if err := os.Remove(filePath); err != nil {
					log.Printf("Error deleting file %s after SQL error: %v\n", file.Name(), err)
				} else {
					log.Printf("Deleted file %s after SQL error to prevent repeated processing\n", file.Name())
				}
				continue
			}

			log.Printf("SQL command output: %s\n", string(output))

			// Delete the file after successful processing
			if err := os.Remove(filePath); err != nil {
				log.Printf("Error deleting file %s: %v\n", file.Name(), err)
			}
		}
		// else {
		// 	log.Printf("Reminder %s is not due yet (%s, now is %s)\n", file.Name(), reminderTime, now)
		// }
	}
}

// DAWG Why is cron in docker so unstable
func StartCronJob() {
	ProcessReminders()

	ticker := time.NewTicker(10 * time.Second)
	go func() {
		for range ticker.C {
			ProcessReminders()
		}
	}()
}
