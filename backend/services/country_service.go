package services

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sort"

	"github.com/anuragdevon/holiday-calendar/models"
)

type CountryService struct {
	apiURL string
}

func NewCountryService() *CountryService {
	return &CountryService{
		apiURL: "https://restcountries.com/v3.1/all",
	}
}

type restCountryResponse struct {
	Name struct {
		Common string `json:"common"`
	} `json:"name"`
	CCA2 string `json:"cca2"`
}

func (s *CountryService) GetCountries() []models.Country {
	resp, err := http.Get(s.apiURL)
	if err != nil {
		fmt.Printf("Error fetching countries: %v\n", err)
		return []models.Country{}
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Error reading response: %v\n", err)
		return []models.Country{}
	}

	var restCountries []restCountryResponse
	if err := json.Unmarshal(body, &restCountries); err != nil {
		fmt.Printf("Error parsing JSON: %v\n", err)
		return []models.Country{}
	}

	countries := make([]models.Country, 0, len(restCountries))
	for _, rc := range restCountries {
		countries = append(countries, models.Country{
			Code: rc.CCA2,
			Name: rc.Name.Common,
		})
	}
	sort.Slice(countries, func(i, j int) bool {
		return countries[i].Name < countries[j].Name
	})

	return countries
}
