package api

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/m41den/vrnctf_pre_hard/backend/db"
	"github.com/m41den/vrnctf_pre_hard/backend/models"
)

func GetReminders(c *fiber.Ctx) error {
	userID := c.Locals("userID").(int)

	rows, err := db.DB.Query("SELECT id, title, content, remind_at, created_at FROM reminders WHERE user_id = $1 ORDER BY created_at DESC", userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Не удалось получить напоминания",
		})
	}
	defer rows.Close()

	var reminders []models.Reminder
	for rows.Next() {
		var r models.Reminder
		if err := rows.Scan(&r.ID, &r.Title, &r.Content, &r.RemindAt, &r.CreatedAt); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Не удалось получить напоминания",
			})
		}
		r.UserID = userID
		reminders = append(reminders, r)
	}

	return c.JSON(reminders)
}

func GetReminder(c *fiber.Ctx) error {
	userID := c.Locals("userID").(int)

	id := c.Params("id")
	var r models.Reminder

	err := db.DB.QueryRow("SELECT id, title, content, remind_at, created_at FROM reminders WHERE id = $1 AND user_id = $2", id, userID).
		Scan(&r.ID, &r.Title, &r.Content, &r.RemindAt, &r.CreatedAt)

	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Не удалось получить напоминание",
		})
	}

	r.UserID = userID

	return c.JSON(r)
}

func CreateReminder(c *fiber.Ctx) error {
	userID := c.Locals("userID").(int)

	var req models.ReminderRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.Title == "" || req.Content == "" || req.RemindAt == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Название, содержание и время напоминания обязательны",
		})
	}

	reminderTime, err := time.Parse(time.RFC3339, req.RemindAt)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Неверный формат времени напоминания. Требуется ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)",
		})
	}

	if reminderTime.Before(time.Now()) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Нельзя создать напоминание в прошлом",
		})
	}

	filename := fmt.Sprintf("%s.json", uuid.New().String())
	filePath := filepath.Join(REMINDERS_DIR, filename)

	pendingReminder := models.PendingReminder{
		UserID:   userID,
		Title:    req.Title,
		Content:  req.Content,
		RemindAt: req.RemindAt,
		Filename: filename,
	}

	pendingJSON, err := json.Marshal(pendingReminder)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Не удалось создать напоминание",
		})
	}

	if err := os.WriteFile(filePath, pendingJSON, 0644); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Не удалось создать напоминание",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Напоминание создано",
		"id":      filename,
	})
}

func DeleteReminder(c *fiber.Ctx) error {
	userID := c.Locals("userID").(int)

	id := c.Params("id")

	res, err := db.DB.Exec("DELETE FROM reminders WHERE id = $1 AND user_id = $2", id, userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Не удалось удалить напоминание",
		})
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil || rowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Напоминание не найдено",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Напоминание удалено",
	})
}
