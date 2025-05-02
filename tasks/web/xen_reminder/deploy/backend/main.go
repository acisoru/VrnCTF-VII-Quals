package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/m41den/vrnctf_pre_hard/backend/api"
	"github.com/m41den/vrnctf_pre_hard/backend/cron"
	"github.com/m41den/vrnctf_pre_hard/backend/db"
)

func main() {
	db.InitDB()
	defer db.CloseDB()

	app := fiber.New(fiber.Config{
		AppName: "XenReminder",
	})

	app.Use(logger.New())
	app.Use(cors.New())

	api.SetupRoutes(app)

	cron.StartCronJob()

	go func() {
		port := os.Getenv("PORT")
		if port == "" {
			port = "8080"
		}
		if err := app.Listen(":" + port); err != nil {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Fancy Ctrl+C handling
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")
	if err := app.Shutdown(); err != nil {
		log.Fatalf("Server shutdown failed: %v", err)
	}
}
