# Holiday Calendar Application

A dynamic calendar application that displays national holidays for different countries with visual highlighting based on holiday frequency per week. The application supports both monthly and quarterly views with country-specific holiday data.

## Features

- Monthly and quarterly calendar views
- National holiday display for multiple countries
- Visual week highlighting based on holiday frequency
- Country selection
- Responsive design
- Real-time holiday data from external APIs

## Tech Stack

### Frontend
- Angular (Latest LTS version)
- Angular Material
- TypeScript
- Angular HttpClient

### Backend
- Go (Golang)
- Gin Web Framework
- External Holiday APIs integration

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 18.13.0 or later)
- npm (version 8.19.3 or later)
- Angular CLI (version 13.0.0 or later)
- Go (1.16 or later)
- Git

## Project Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Go dependencies:
   ```bash
   go mod tidy
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```env
   # Server Configuration
   PORT=8080
   ENV=development

   # CORS Configuration
   ALLOWED_ORIGINS= allowed all origin for dev

   # Holiday API Configuration

   HOLIDAY_API_KEY=sdik5jj85QG72aYX88Cbq3ifRALVZebw( only 500 free calls :)


4. Run the backend server:
   ```bash
   go run main.go
   ```
   The server will start on http://localhost:8080

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```
   The application will be available at http://localhost:4200

## Project Structure

```
├── backend/
│   ├── main.go
│   ├── handlers/
│   ├── services/
│   ├── models/
│   └── config/
└── frontend/
    ├── src/
    │   ├── app/
    │   ├── assets/
    │   └── environments/
    └── angular.json
```

## API Endpoints

### GET /api/countries
Retrieves list of supported countries

### GET /api/holidays
Retrieves holidays for specific country and date range
- Query Parameters:
  - country (required): Country code (e.g., "IN")
  - year (required): Year (e.g., "2024")
  - month (optional): Month for monthly view (1-12)
  - quarter (optional): Quarter for quarterly view (1-4)

## Development

### Backend Development
- The backend is written in Go using the Gin framework
- API endpoints are defined in the handlers directory
- Services contain business logic and external API integration
- Models define the data structures

### Frontend Development
- The frontend is built with Angular and Angular Material
- Components are organized by feature
- Services handle API communication
- Models define TypeScript interfaces for data


## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details 