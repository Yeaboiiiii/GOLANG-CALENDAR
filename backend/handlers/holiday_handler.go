package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/anuragdevon/holiday-calendar/models"
	"github.com/anuragdevon/holiday-calendar/services"
	"github.com/gin-gonic/gin"
)

type HolidayHandler struct {
	holidayService *services.HolidayService
}

func NewHolidayHandler(holidayService *services.HolidayService) *HolidayHandler {
	return &HolidayHandler{
		holidayService: holidayService,
	}
}

func (h *HolidayHandler) GetHolidays(c *gin.Context) {
	country := c.Query("country")
	yearStr := c.Query("year")
	monthStr := c.Query("month")
	quarterStr := c.Query("quarter")

	if country == "" || yearStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "country and year are required"})
		return
	}

	year, err := strconv.Atoi(yearStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid year format"})
		return
	}

	var month, quarter *int

	if monthStr != "" {
		m, err := strconv.Atoi(monthStr)
		if err != nil || m < 1 || m > 12 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid month format"})
			return
		}
		month = &m
	}

	if quarterStr != "" {
		q, err := strconv.Atoi(quarterStr)
		if err != nil || q < 1 || q > 4 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid quarter format"})
			return
		}
		quarter = &q
	}

	if month == nil && quarter == nil {
		currentMonth := int(time.Now().Month())
		month = &currentMonth
	}

	holidays, err := h.holidayService.GetHolidays(country, year, month, quarter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	period := ""
	if month != nil {
		period = time.Date(year, time.Month(*month), 1, 0, 0, 0, 0, time.UTC).Format("2006-01")
	} else if quarter != nil {
		startMonth := (*quarter-1)*3 + 1
		period = time.Date(year, time.Month(startMonth), 1, 0, 0, 0, 0, time.UTC).Format("2006-Q1")
	}

	response := models.HolidayResponse{
		Holidays: holidays,
		Country:  country,
		Period:   period,
	}

	c.JSON(http.StatusOK, response)
}
