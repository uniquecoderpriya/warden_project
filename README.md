# Warden Properties - Weather-Based Property Search

A full-stack application that helps users find properties based on real-time weather conditions. The system integrates weather data from Open-Meteo API with property information to provide intelligent filtering and search capabilities.

## 🏗️ Architecture

- **Backend**: Node.js + Express + TypeScript + Prisma + MySQL
- **Frontend**: Next.js 15 + React 19 + Redux Toolkit + Tailwind CSS + Ant Design
- **Database**: MySQL with Prisma ORM
- **Weather API**: Open-Meteo (free weather data)
- **State Management**: Redux Toolkit with React-Redux

## 🚀 Features

### Backend Features

- **Weather Integration**: Real-time weather data from Open-Meteo API
- **Property Management**: CRUD operations for property data
- **Advanced Filtering**: Weather-based property filtering
- **Search Functionality**: Text search across property names, cities, and states
- **Pagination**: Efficient data pagination
- **Caching**: In-memory weather data caching (5-minute TTL)
- **CORS Support**: Configured for frontend integration

### Frontend Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Search**: Debounced search with instant results
- **Weather Filtering**: Filter by temperature, humidity, and weather conditions
- **Interactive UI**: Modern design with Ant Design components
- **State Management**: Redux for efficient state handling
- **Dynamic Styling**: Scroll-based header effects and animations
- **Property Cards**: Rich property display with weather information

## 📁 Project Structure

```
startupproject/
├── warden-test-one/           # Backend API
│   ├── src/
│   │   ├── index.ts          # Express server setup
│   │   ├── database/
│   │   │   └── prisma.ts     # Prisma client
│   │   └── use-cases/
│   │       └── getProperties.ts # Property API logic
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   ├── seed.ts          # Database seeding
│   │   └── seed.data.ts     # Sample property data
│   └── package.json
├── warden-frontend/
│   └── warden-front/         # Frontend Next.js app
│       ├── app/
│       │   ├── components/   # React components
│       │   ├── store/        # Redux store configuration
│       │   ├── providers/    # Redux provider
│       │   └── hooks/        # Custom Redux hooks
│       └── package.json
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MySQL database
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd warden-test-one
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create `.env` file in `warden-test-one/` directory:

   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/warden_properties"
   PORT=5000
   ```

4. **Database Setup**

   ```bash
   # Generate Prisma client
   npm run prisma:gen

   # Run database migrations
   npx prisma db push

   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the backend server**
   ```bash
   npm run dev
   ```
   Backend will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd warden-frontend/warden-front
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   Frontend will be available at `http://localhost:3000`

## 🗄️ Database Schema

### Property Table

```sql
CREATE TABLE Property (
  id        INT PRIMARY KEY AUTO_INCREMENT,
  name      VARCHAR(255) NOT NULL,
  city      VARCHAR(255),
  state     VARCHAR(255),
  country   VARCHAR(255) DEFAULT 'India',
  lat       DECIMAL(10, 8),
  lng       DECIMAL(11, 8),
  geohash5  VARCHAR(255),
  isActive  BOOLEAN DEFAULT true,
  tags      JSON,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔌 API Endpoints

### GET /get-properties

Retrieve properties with optional filtering and pagination.

**Query Parameters:**

- `searchText` (string): Search in name, city, or state
- `temperatureMin` (number): Minimum temperature filter
- `temperatureMax` (number): Maximum temperature filter
- `humidityMin` (number): Minimum humidity filter
- `humidityMax` (number): Maximum humidity filter
- `weatherCondition` (string): Weather condition filter (clear, cloudy, drizzle, rainy, snow)
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 8, max: 50)

**Example Request:**

```bash
curl "http://localhost:5000/get-properties?temperatureMin=20&weatherCondition=clear&page=1&limit=8"
```

**Response Format:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Warden Chennai 001",
      "city": "Chennai",
      "state": "Tamil Nadu",
      "country": "India",
      "lat": 13.08753,
      "lng": 80.2656,
      "isActive": true,
      "tags": ["housekeeping"],
      "weather": {
        "current": {
          "temperature": 28.5,
          "humidity": 75,
          "weatherCondition": "clear",
          "windSpeed": 12.3,
          "time": "2024-01-15T10:30:00Z"
        }
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 25,
    "totalCount": 200,
    "limit": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## 🎨 Frontend Components

### Core Components

- **Card**: Property display component with weather information
- **Filter**: Weather-based filtering interface
- **Search**: Text search with debouncing
- **Pagination**: Responsive pagination with Ant Design

### State Management

- **Redux Store**: Centralized state management
- **Properties Slice**: Property data and filtering logic
- **Async Thunks**: API integration with loading states

## 🌤️ Weather Integration

The application integrates with Open-Meteo API to provide real-time weather data:

- **Temperature**: Current temperature in Celsius
- **Humidity**: Relative humidity percentage
- **Weather Conditions**: Clear, Cloudy, Drizzle, Rainy, Snow
- **Wind Speed**: Current wind speed
- **Caching**: 5-minute cache to reduce API calls

## 🔧 Development Scripts

### Backend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run prisma:gen   # Generate Prisma client
npm run db:seed      # Seed database
```

### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

## 🚀 Deployment

### Backend Deployment

1. Build the application: `npm run build`
2. Set production environment variables
3. Run database migrations
4. Start the server: `npm start`

### Frontend Deployment

1. Build the application: `npm run build`
2. Deploy the `out` directory to your hosting service
3. Configure environment variables for production API URL

## 🧪 Testing

### Backend Testing

```bash
# Test API endpoints
curl "http://localhost:5000/get-properties"
curl "http://localhost:5000/get-properties?searchText=Chennai"
curl "http://localhost:5000/get-properties?temperatureMin=25&weatherCondition=clear"
```

### Frontend Testing

- Open `http://localhost:3000`
- Test search functionality
- Test weather filtering
- Test responsive design on different screen sizes

## 📊 Performance Optimizations

- **Weather Caching**: 5-minute TTL to reduce API calls
- **Parallel Processing**: Concurrent weather data fetching
- **Debounced Search**: Prevents excessive API calls
- **Pagination**: Efficient data loading
- **Image Optimization**: Optimized property images

## 🔒 Security Considerations

- **CORS Configuration**: Properly configured for frontend access
- **Input Validation**: Server-side parameter validation
- **Rate Limiting**: Consider implementing for production
- **Environment Variables**: Sensitive data in environment files

## 📝 Environment Variables

### Backend (.env)

```env
DATABASE_URL="mysql://username:password@localhost:3306/warden_properties"
PORT=5000
```

### Frontend

No environment variables required for development. For production, configure API URL.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS is configured for frontend URL
2. **Database Connection**: Verify DATABASE_URL in .env file
3. **Weather API Failures**: Check internet connection and API availability
4. **Build Errors**: Ensure all dependencies are installed

### Support

For issues and questions, please create an issue in the repository or contact the development team.
