package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/anuragdevon/holiday-calendar/config"
	"github.com/anuragdevon/holiday-calendar/models"
)

type HolidayService struct {
	config *config.Config
}

func NewHolidayService(cfg *config.Config) *HolidayService {
	return &HolidayService{
		config: cfg,
	}
}

func (s *HolidayService) GetHolidays(country string, year int, month, quarter *int) ([]models.Holiday, error) {
	if s.config.HolidayAPIKey == "" {
		return nil, fmt.Errorf("API key not configured")
	}

	url := fmt.Sprintf("%s/holidays?api_key=%s&country=%s&year=%d&type=national,local,religious",
		strings.TrimRight(s.config.HolidayAPIURL, "/"),
		s.config.HolidayAPIKey,
		country,
		year,
	)

	if month != nil {
		url += fmt.Sprintf("&month=%d", *month)
	}

	log.Printf("Making request to: %s", url)

	resp, err := http.Get(url)
	if err != nil {
		log.Printf("Error making request: %v", err)
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		log.Printf("API returned non-200 status: %d, body: %s", resp.StatusCode, string(body))
		return nil, fmt.Errorf("API request failed with status: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error reading response body: %v", err)
		return nil, fmt.Errorf("failed to read response body: %v", err)
	}
	//log.Printf("API Response: %s", string(body))

	var apiResponse struct {
		Meta struct {
			Code int `json:"code"`
		} `json:"meta"`
		Response struct {
			Holidays []struct {
				Name        string `json:"name"`
				Description string `json:"description"`
				Country     struct {
					ID   string `json:"id"`
					Name string `json:"name"`
				} `json:"country"`
				Date struct {
					ISO string `json:"iso"`
				} `json:"date"`
				Type      []string `json:"type,omitempty"`
				Primary   string   `json:"primary_type,omitempty"`
				URLid     string   `json:"urlid"`
				Locations string   `json:"locations"`
			} `json:"holidays"`
		} `json:"response"`
	}

	if err := json.NewDecoder(bytes.NewReader(body)).Decode(&apiResponse); err != nil {
		log.Printf("Error decoding response: %v", err)
		return nil, fmt.Errorf("failed to decode API response: %v", err)
	}

	if apiResponse.Meta.Code != 200 {
		log.Printf("API returned non-200 code: %d", apiResponse.Meta.Code)
		return nil, fmt.Errorf("API returned non-200 code: %d", apiResponse.Meta.Code)
	}

	holidays := make([]models.Holiday, 0)
	for _, h := range apiResponse.Response.Holidays {
		date, err := time.Parse("2006-01-02", h.Date.ISO)
		if err != nil {
			continue
		}

		if month != nil && int(date.Month()) != *month {
			continue
		}

		if quarter != nil {
			currentMonth := int(date.Month())
			startMonth := (*quarter-1)*3 + 1
			endMonth := startMonth + 2
			if currentMonth < startMonth || currentMonth > endMonth {
				continue
			}
		}

		holidayType := "national"
		if h.Primary != "" {
			holidayType = h.Primary
		} else if len(h.Type) > 0 {
			holidayType = h.Type[0]
		}

		holiday := models.Holiday{
			Date:        h.Date.ISO,
			Name:        h.Name,
			Type:        holidayType,
			Country:     h.Country.ID,
			Description: h.Description,
		}
		holidays = append(holidays, holiday)
	}

	return deduplicateHolidays(holidays), nil
}

func deduplicateHolidays(holidays []models.Holiday) []models.Holiday {
	seen := make(map[string]bool)
	result := make([]models.Holiday, 0)

	for _, holiday := range holidays {
		key := holiday.Date + "|" + holiday.Name
		if !seen[key] {
			seen[key] = true
			result = append(result, holiday)
		}
	}

	return result
}
