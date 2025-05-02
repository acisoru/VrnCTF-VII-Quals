package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func InitDB() {
	// Always hardcode credentials, kids
	host := "localhost"
	port := 5432
	user := "postgres"
	password := "postgres"
	dbname := "reminders"

	if os.Getenv("DB_HOST") != "" {
		host = os.Getenv("DB_HOST")
	}
	if os.Getenv("DB_USER") != "" {
		user = os.Getenv("DB_USER")
	}
	if os.Getenv("DB_PASSWORD") != "" {
		password = os.Getenv("DB_PASSWORD")
	}
	if os.Getenv("DB_NAME") != "" {
		dbname = os.Getenv("DB_NAME")
	}

	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	var err error
	DB, err = sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatalf("Could not connect to database: %v", err)
	}

	err = DB.Ping()
	if err != nil {
		log.Fatalf("Could not ping database: %v", err)
	}

	log.Println("Successfully connected to database")

	createTables()
}

func createTables() {
	createTableSQL := `
	CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		username VARCHAR(50) NOT NULL UNIQUE,
		password VARCHAR(100) NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS reminders (
		id SERIAL PRIMARY KEY,
		user_id INTEGER NOT NULL,
		title VARCHAR(100) NOT NULL,
		content TEXT NOT NULL,
		remind_at TIMESTAMP NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id) REFERENCES users(id)
	);

	CREATE TABLE IF NOT EXISTS flag (
		id SERIAL PRIMARY KEY,
		flag VARCHAR(100) NOT NULL
	);

	CREATE TABLE IF NOT EXISTS rate_limits (
		ip VARCHAR(45) PRIMARY KEY,
		attempts INTEGER NOT NULL DEFAULT 1,
		last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	`

	_, err := DB.Exec(createTableSQL)
	if err != nil {
		log.Fatalf("Could not create tables: %v", err)
	}

	// FLAG IS HERE, YES THAT'S WHAT YOU NEED
	var count int
	err = DB.QueryRow("SELECT COUNT(*) FROM flag").Scan(&count)
	if err != nil {
		log.Fatalf("Could not check flag existence: %v", err)
	}

	if count == 0 {
		_, err = DB.Exec("INSERT INTO flag (flag) VALUES ($1)", os.Getenv("FLAG"))
		if err != nil {
			log.Fatalf("Could not insert flag: %v", err)
		}
	}
}

func CloseDB() {
	if DB != nil {
		DB.Close()
	}
}
