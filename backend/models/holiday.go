package models

type Holiday struct {
	Date        string `json:"date"`
	Name        string `json:"name"`
	Type        string `json:"type"`
	Country     string `json:"country"`
	Description string `json:"description,omitempty"`
}

type HolidayResponse struct {
	Holidays []Holiday `json:"holidays"`
	Country  string    `json:"country"`
	Period   string    `json:"period"`
}

type WeekHighlight struct {
	WeekNumber   int    `json:"weekNumber"`
	HighlightType string `json:"highlightType"`
	HolidayCount int    `json:"holidayCount"`
}