# Eightfold AI Resume Parser UI

A modern React application for uploading resumes, managing job positions, and viewing match scores. This frontend connects to a serverless backend built with AWS Lambda, API Gateway, DynamoDB, S3, and SQS.

## Features

- **Resume Upload**: Drag-and-drop PDF resume upload with job selection
- **Job Management**: Create, view, and manage job positions
- **Match Scores**: View and analyze resume match scores with filtering and sorting
- **Serverless Backend**: Connects to AWS serverless infrastructure
- **Responsive Design**: Modern Material-UI interface
- **Error Handling**: Comprehensive error handling with fallback to mock data

## Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Deployed serverless backend (see backend README for deployment instructions)

## Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd eightfold-ai-resume-parser-ui
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   
   Create a `.env` file in the root directory:
   ```bash
   # API Gateway URL for the serverless backend
   # Replace with your actual API Gateway URL after deployment
   REACT_APP_API_URL=https://your-api-gateway-url.execute-api.region.amazonaws.com/dev
   
   # Development settings
   REACT_APP_ENVIRONMENT=development
   REACT_APP_DEBUG=true
   
   # Optional: Enable mock data fallback when backend is unavailable
   REACT_APP_USE_MOCK_FALLBACK=true
   ```

## Configuration

### API Gateway URL

After deploying the serverless backend, you'll need to update the `REACT_APP_API_URL` in your `.env` file with the actual API Gateway URL. You can find this URL in the AWS Console or in the serverless deployment output.

The URL format is:
```
https://{api-id}.execute-api.{region}.amazonaws.com/{stage}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | API Gateway URL for the serverless backend | `https://your-api-gateway-url.execute-api.region.amazonaws.com/dev` |
| `REACT_APP_ENVIRONMENT` | Environment (development/production) | `development` |
| `REACT_APP_DEBUG` | Enable debug logging | `true` |
| `REACT_APP_USE_MOCK_FALLBACK` | Use mock data when backend is unavailable | `true` |

## Running the Application

### Development Mode

```bash
npm start
```

The application will open at `http://localhost:3000`.

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

### Testing

```bash
npm test
```

## Backend Connection

The frontend connects to the serverless backend through the following endpoints:

### Resume Upload
- **POST** `/resume/upload` - Upload resume with job selection

### Job Management
- **GET** `/jobs` - Get all jobs
- **POST** `/jobs` - Create new job
- **GET** `/jobs/{jobId}` - Get specific job
- **PUT** `/jobs/{jobId}` - Update job
- **DELETE** `/jobs/{jobId}` - Delete job

### Match Scores
- **GET** `/matches` - Get all match scores
- **GET** `/matches/{jobId}` - Get match scores for specific job
- **GET** `/matches?resumeId={resumeId}` - Get match scores for specific resume
- **GET** `/matches?limit={limit}` - Get top match scores

## Error Handling

The application includes comprehensive error handling:

1. **Backend Health Check**: Automatically checks if the backend is available
2. **Mock Data Fallback**: Uses mock data when backend is unavailable (configurable)
3. **User Notifications**: Shows appropriate messages for different error scenarios
4. **Retry Logic**: Built-in retry mechanisms for failed requests

## File Structure

```
src/
├── components/          # React components
│   ├── JobList.js      # Job management component
│   ├── MatchScores.js  # Match scores display component
│   └── ResumeUpload.js # Resume upload component
├── config/             # Configuration files
│   └── api.config.js   # API configuration
├── services/           # API services
│   └── api.js         # API client and endpoints
└── App.js             # Main application component
```

## Troubleshooting

### Backend Connection Issues

1. **Check API Gateway URL**: Ensure the `REACT_APP_API_URL` is correct
2. **Verify CORS**: Make sure the backend has CORS enabled for your domain
3. **Check Network**: Verify network connectivity and firewall settings
4. **Backend Status**: Ensure the serverless backend is deployed and running

### Common Errors

- **502/503 Errors**: Serverless function may be cold starting or timed out
- **CORS Errors**: Backend CORS configuration may need updating
- **Timeout Errors**: Large file uploads may need longer timeout settings

### Development Tips

1. **Mock Mode**: Use `REACT_APP_USE_MOCK_FALLBACK=true` for development without backend
2. **Debug Mode**: Enable `REACT_APP_DEBUG=true` for detailed API logging
3. **Local Development**: Use `serverless-offline` for local backend development

## Deployment

### Static Hosting

The application can be deployed to any static hosting service:

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy the `build` folder** to your hosting service (AWS S3, Netlify, Vercel, etc.)

### Environment Configuration

For production deployment, update the environment variables:

```bash
REACT_APP_API_URL=https://your-production-api-gateway-url.execute-api.region.amazonaws.com/prod
REACT_APP_ENVIRONMENT=production
REACT_APP_DEBUG=false
REACT_APP_USE_MOCK_FALLBACK=false
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please create an issue in the repository or contact the development team.
