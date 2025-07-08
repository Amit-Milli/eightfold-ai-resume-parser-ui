# Frontend Configuration Guide

This guide will help you configure the frontend to connect to the serverless backend.

## Quick Setup

1. **Run the setup script**:
   ```bash
   ./scripts/setup.sh
   ```

2. **Deploy the backend** (if not already done):
   ```bash
   cd ../resume-parser-be-serverless
   npm install
   serverless deploy --stage dev
   ```

3. **Update the API URL** in `.env` with your API Gateway URL

4. **Start the frontend**:
   ```bash
   npm start
   ```

## Manual Configuration

### Step 1: Environment Variables

Create a `.env` file in the root directory:

```bash
# API Gateway URL for the serverless backend
REACT_APP_API_URL=https://your-api-gateway-url.execute-api.region.amazonaws.com/dev

# Development settings
REACT_APP_ENVIRONMENT=development
REACT_APP_DEBUG=true

# Optional: Enable mock data fallback when backend is unavailable
REACT_APP_USE_MOCK_FALLBACK=true
```

### Step 2: Get Your API Gateway URL

After deploying the backend, you can find your API Gateway URL in several ways:

#### Option A: AWS Console
1. Go to AWS API Gateway Console
2. Find your API (named something like `resume-parser-dev`)
3. Copy the Invoke URL

#### Option B: Serverless Output
After running `serverless deploy`, look for output like:
```
endpoints:
  POST - https://abc123.execute-api.us-east-1.amazonaws.com/dev/resume/upload
  ANY - https://abc123.execute-api.us-east-1.amazonaws.com/dev/jobs
  ANY - https://abc123.execute-api.us-east-1.amazonaws.com/dev/matches
```

Use the base URL: `https://abc123.execute-api.us-east-1.amazonaws.com/dev`

#### Option C: Serverless Info
```bash
cd ../resume-parser-be-serverless
serverless info --stage dev
```

### Step 3: Update Configuration

Replace the placeholder URL in your `.env` file with your actual API Gateway URL.

### Step 4: Test Connection

Start the frontend and check the browser console for connection status:

```bash
npm start
```

## Troubleshooting

### Backend Not Available
If you see "Backend unavailable" warnings:

1. **Check API URL**: Ensure the URL in `.env` is correct
2. **Verify Deployment**: Make sure the backend is deployed
3. **Check CORS**: Ensure CORS is enabled in the backend
4. **Network Issues**: Check firewall and network connectivity

### CORS Errors
If you see CORS errors in the browser console:

1. **Check API Gateway CORS**: Ensure CORS is configured in the backend
2. **Verify Domain**: Make sure your frontend domain is allowed
3. **Check Headers**: Verify the correct headers are being sent

### Timeout Errors
For large file uploads:

1. **Increase Timeout**: The frontend is configured with 60-second timeout for uploads
2. **Check Lambda Timeout**: Ensure Lambda functions have sufficient timeout
3. **File Size**: Check if the file is within the 10MB limit

## Development vs Production

### Development
```bash
REACT_APP_API_URL=https://your-api-gateway-url.execute-api.region.amazonaws.com/dev
REACT_APP_ENVIRONMENT=development
REACT_APP_DEBUG=true
REACT_APP_USE_MOCK_FALLBACK=true
```

### Production
```bash
REACT_APP_API_URL=https://your-api-gateway-url.execute-api.region.amazonaws.com/prod
REACT_APP_ENVIRONMENT=production
REACT_APP_DEBUG=false
REACT_APP_USE_MOCK_FALLBACK=false
```

## Mock Mode

If you want to develop without the backend:

1. **Set mock fallback**: `REACT_APP_USE_MOCK_FALLBACK=true`
2. **Use any API URL**: The app will fall back to mock data when backend is unavailable
3. **Test features**: You can test the UI without a working backend

## API Endpoints

The frontend expects these endpoints from the backend:

- `POST /resume/upload` - Upload resume
- `GET /jobs` - Get all jobs
- `POST /jobs` - Create job
- `GET /jobs/{id}` - Get specific job
- `PUT /jobs/{id}` - Update job
- `DELETE /jobs/{id}` - Delete job
- `GET /matches` - Get all match scores
- `GET /matches/{jobId}` - Get match scores for job

## Security Considerations

1. **HTTPS Only**: Always use HTTPS in production
2. **API Keys**: Consider adding API key authentication if needed
3. **CORS**: Configure CORS properly for your domain
4. **Rate Limiting**: Implement rate limiting on the backend

## Performance Tips

1. **CDN**: Use a CDN for static assets
2. **Caching**: Implement proper caching headers
3. **Compression**: Enable gzip compression
4. **Optimization**: Use production builds for deployment 