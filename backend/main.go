package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/anuragdevon/holiday-calendar/config"
	"github.com/anuragdevon/holiday-calendar/handlers"
	"github.com/anuragdevon/holiday-calendar/services"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.LoadConfig()

	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	router.SetTrustedProxies([]string{"127.0.0.1"})

	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{"*"}
	corsConfig.AllowMethods = []string{"GET", "POST", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Accept"}
	router.Use(cors.New(corsConfig))

	holidayService := services.NewHolidayService(cfg)
	countryService := services.NewCountryService()

	holidayHandler := handlers.NewHolidayHandler(holidayService)
	countryHandler := handlers.NewCountryHandler(countryService)

	api := router.Group("/api")
	{
		api.GET("/countries", countryHandler.GetCountries)
		api.GET("/holidays", holidayHandler.GetHolidays)
	}

	addr := fmt.Sprintf(":%d", cfg.Port)
	log.Printf("Starting server on %s\n", addr)
	if err := router.Run(addr); err != nil && err != http.ErrServerClosed {
		log.Fatal("Failed to start server:", err)
	}
}
