package models

type Country struct {
	Code string `json:"code"`
	Name string `json:"name"`
}

type CountryResponse struct {
	Countries []Country `json:"countries"`
}