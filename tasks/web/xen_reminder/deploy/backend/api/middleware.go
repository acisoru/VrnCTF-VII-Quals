package api

import (
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/m41den/vrnctf_pre_hard/backend/db"
	"github.com/m41den/vrnctf_pre_hard/backend/utils"
)

func AuthMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")

		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Authorization header is required",
			})
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Authorization header format must be Bearer {token}",
			})
		}

		tokenString := parts[1]

		userID, err := utils.ValidateToken(tokenString)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid or expired token",
			})
		}

		c.Locals("userID", userID)

		return c.Next()
	}
}

// NO BRUTFORCING OR SPAM PLEAAAASE
func RateLimitMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		ip := c.IP()

		// Check if the IP is already rate limited
		var attempts int
		var lastAttempt time.Time

		// Postgres will max out cpu like no tomorrow, but at least i dont need to deploy redis1
		err := db.DB.QueryRow("SELECT attempts, last_attempt FROM rate_limits WHERE ip = $1", ip).Scan(&attempts, &lastAttempt)
		if err == nil {
			// Check if 5 minutes have passed since the last attempt
			if time.Since(lastAttempt) > 5*time.Minute {
				// Reset attempts if 5 minutes have passed
				_, err = db.DB.Exec("UPDATE rate_limits SET attempts = 1, last_attempt = CURRENT_TIMESTAMP WHERE ip = $1", ip)
				if err != nil {
					return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
						"error": "Could not update rate limit",
					})
				}
			} else if attempts >= 3 {
				// Rate limit exceeded
				return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
					"error":       "Rate limit exceeded. Try again later.",
					"retry_after": lastAttempt.Add(5 * time.Minute).Unix(),
				})
			} else {
				_, err = db.DB.Exec("UPDATE rate_limits SET attempts = attempts + 1, last_attempt = CURRENT_TIMESTAMP WHERE ip = $1", ip)
				if err != nil {
					return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
						"error": "Could not update rate limit",
					})
				}
			}
		} else {
			_, err = db.DB.Exec("INSERT INTO rate_limits (ip, attempts, last_attempt) VALUES ($1, 1, CURRENT_TIMESTAMP)", ip)
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Could not create rate limit",
				})
			}
		}

		return c.Next()
	}
}
