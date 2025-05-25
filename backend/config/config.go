package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port           int
	Env            string
	AllowedOrigins []string
	HolidayAPIKey  string
	HolidayAPIURL  string
}

func LoadConfig() *Config {

	if err := godotenv.Load(); err != nil {
		if os.IsNotExist(err) {
			log.Println("Warning: .env file not found")
		} else {
			log.Printf("Error loading .env file: %v\n", err)
		}
	}

	port, _ := strconv.Atoi(getEnvOrDefault("PORT", "8081"))

	return &Config{
		Port:           port,
		Env:            getEnvOrDefault("ENV", "development"),
		AllowedOrigins: []string{getEnvOrDefault("ALLOWED_ORIGINS", "http://localhost:53291,http://localhost:4200,http://localhost:8081")},
		HolidayAPIKey:  getEnvOrDefault("HOLIDAY_API_KEY", "sdik5jj85QG72aYX88Cbq3ifRALVZebw"),
		HolidayAPIURL:  getEnvOrDefault("HOLIDAY_API_URL", "https://calendarific.com/api/v2"),
	}
}

func getEnvOrDefault(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
