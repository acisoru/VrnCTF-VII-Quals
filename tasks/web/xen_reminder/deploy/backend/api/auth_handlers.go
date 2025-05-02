package api

import (
	"github.com/gofiber/fiber/v2"
	"github.com/m41den/vrnctf_pre_hard/backend/db"
	"github.com/m41den/vrnctf_pre_hard/backend/models"
	"github.com/m41den/vrnctf_pre_hard/backend/utils"
)

func Register(c *fiber.Ctx) error {
	var req models.UserRegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.Username == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Укажите имя пользователя и пароль",
		})
	}

	var count int
	err := db.DB.QueryRow("SELECT COUNT(*) FROM users WHERE username = $1", req.Username).Scan(&count)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Backend has exploded. Notify task author",
		})
	}

	if count > 0 {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "Пользователь с таким именем уже существует",
		})
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not hash password for unknown reasons",
		})
	}

	var userID int
	err = db.DB.QueryRow(
		"INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id",
		req.Username, hashedPassword,
	).Scan(&userID)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not create user for unknown reasons",
		})
	}

	token, err := utils.GenerateToken(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not generate token for unknown reasons",
		})
	}

	var user models.User
	err = db.DB.QueryRow(
		"SELECT id, username, password, created_at FROM users WHERE id = $1",
		userID,
	).Scan(&user.ID, &user.Username, &user.Password, &user.CreatedAt)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not retrieve user for unknown reasons",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(models.AuthResponse{
		User:  utils.CreateUserResponse(user),
		Token: token,
	})
}

func Login(c *fiber.Ctx) error {
	var req models.UserLoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.Username == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Укажите имя пользователя и пароль",
		})
	}

	var user models.User
	err := db.DB.QueryRow(
		"SELECT id, username, password, created_at FROM users WHERE username = $1",
		req.Username,
	).Scan(&user.ID, &user.Username, &user.Password, &user.CreatedAt)

	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Неверное имя пользователя или пароль",
		})
	}

	if !utils.CheckPasswordHash(req.Password, user.Password) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Неверное имя пользователя или пароль",
		})
	}

	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not generate token for unknown reasons",
		})
	}

	return c.JSON(models.AuthResponse{
		User:  utils.CreateUserResponse(user),
		Token: token,
	})
}

func GetCurrentUser(c *fiber.Ctx) error {
	userID := c.Locals("userID").(int)

	var user models.User
	err := db.DB.QueryRow(
		"SELECT id, username, password, created_at FROM users WHERE id = $1",
		userID,
	).Scan(&user.ID, &user.Username, &user.Password, &user.CreatedAt)

	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	return c.JSON(utils.CreateUserResponse(user))
}
