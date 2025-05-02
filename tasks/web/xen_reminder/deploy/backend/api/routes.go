package api

import (
	"os"

	"github.com/gofiber/fiber/v2"
)

const REMINDERS_DIR = "./reminders"

func SetupRoutes(app *fiber.App) {
	// Create reminders directory if it doesn't exist
	if _, err := os.Stat(REMINDERS_DIR); os.IsNotExist(err) {
		os.Mkdir(REMINDERS_DIR, 0755)
	}

	api := app.Group("/api")
	setupAuthRoutes(api)
	setupReminderRoutes(api)
}

func setupAuthRoutes(api fiber.Router) {
	api.Post("/register", RateLimitMiddleware(), Register)
	api.Post("/login", Login)
	api.Get("/user", AuthMiddleware(), GetCurrentUser)
}

func setupReminderRoutes(api fiber.Router) {
	reminders := api.Group("/reminders", AuthMiddleware())
	reminders.Get("/", GetReminders)
	reminders.Post("/", CreateReminder)
	reminders.Get("/:id", GetReminder)
	reminders.Delete("/:id", DeleteReminder)
}
