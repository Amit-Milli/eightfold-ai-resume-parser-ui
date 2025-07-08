// API Configuration for serverless backend
const config = {
    // API Gateway URL - Update this with your deployed API Gateway URL
    apiUrl: process.env.REACT_APP_API_URL ?? 'https://c70935dw4m.execute-api.us-east-1.amazonaws.com/mili',

    // Environment settings
    environment: process.env.REACT_APP_ENVIRONMENT ?? 'development',
    debug: process.env.REACT_APP_DEBUG === 'true',

    // Feature flags
    useMockFallback: process.env.REACT_APP_USE_MOCK_FALLBACK === 'true',

    // Timeout settings
    defaultTimeout: 30000, // 30 seconds
    uploadTimeout: 60000,  // 60 seconds for file uploads

    // CORS settings
    corsEnabled: true,

    // Retry settings
    maxRetries: 3,
    retryDelay: 1000, // 1 second
};

export default config; 