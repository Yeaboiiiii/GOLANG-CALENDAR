package handlers

import (
	"net/http"

	"github.com/anuragdevon/holiday-calendar/models"
	"github.com/anuragdevon/holiday-calendar/services"
	"github.com/gin-gonic/gin"
)

type CountryHandler struct {
	countryService *services.CountryService
}

func NewCountryHandler(countryService *services.CountryService) *CountryHandler {
	return &CountryHandler{
		countryService: countryService,
	}
}

func (h *CountryHandler) GetCountries(c *gin.Context) {
	countries := h.countryService.GetCountries()

	response := models.CountryResponse{
		Countries: countries,
	}

	c.JSON(http.StatusOK, response)
}
