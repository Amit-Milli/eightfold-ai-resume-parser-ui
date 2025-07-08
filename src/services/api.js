import axios from 'axios';
import config from '../config/api.config';

// Configure base URL for the serverless backend API Gateway
const API_BASE_URL = config.apiUrl;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: config.defaultTimeout,
});

// Request interceptor for logging
api.interceptors.request.use(
    (config) => {
        if (config.debug) {
            console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        if (config.debug) {
            console.log(`API Response: ${response.status} ${response.config.url}`);
        }
        return response;
    },
    (error) => {
        console.error('API Response Error:', {
            status: error.response?.status,
            message: error.response?.data?.error ?? error.message,
            url: error.config?.url,
        });
        
        // Handle serverless-specific errors
        if (error.response?.status === 502 || error.response?.status === 503) {
            console.error('Serverless function error - function may be cold starting or timed out');
        }
        
        return Promise.reject(error);
    }
);

// Resume Upload API - Updated for serverless backend
export const uploadResume = async (file, jobId, candidateEmail) => {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobId', jobId);
    formData.append('candidateEmail', candidateEmail);

    return api.post('/resume/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        timeout: config.uploadTimeout,
    });
};

// Job Management API - Updated for serverless backend
export const getJobs = async () => {
    return api.get('/jobs');
};

export const createJob = async (jobData) => {
    return api.post('/jobs', jobData);
};

export const getJob = async (jobId) => {
    return api.get(`/jobs/${jobId}`);
};

export const updateJob = async (jobId, jobData) => {
    return api.put(`/jobs/${jobId}`, jobData);
};

export const deleteJob = async (jobId) => {
    return api.delete(`/jobs/${jobId}`);
};

// Match Scores API - Updated for serverless backend
export const getMatchScores = async (jobId) => {
    return api.get(`/matches/${jobId}`);
};

export const getAllMatchScores = async () => {
    return api.get('/matches');
};

export const getMatchScoresByResume = async (resumeId) => {
    return api.get('/matches', { params: { resumeId } });
};

export const getTopMatchScores = async (limit = 10) => {
    return api.get('/matches', { params: { limit } });
};

// Helper function to get API Gateway URL from environment
export const getApiGatewayUrl = () => {
    return API_BASE_URL;
};

// Helper function to check if backend is available
export const checkBackendHealth = async () => {
    try {
        const response = await api.get('/jobs');
        return response.status === 200;
    } catch (error) {
        console.error('Backend health check failed:', error);
        return false;
    }
};

// Mock data for development (fallback when backend is not available)
export const mockJobs = [
    {
        id: 'job-1',
        title: 'Frontend Developer',
        company: 'Tech Corp',
        description: 'We are looking for a skilled frontend developer with React experience.',
        requirements: ['React', 'JavaScript', 'HTML', 'CSS'],
        location: 'San Francisco, CA',
        salary: '$80,000 - $120,000',
        createdAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 'job-2',
        title: 'Backend Developer',
        company: 'Data Systems Inc',
        description: 'Join our backend team to build scalable APIs and services.',
        requirements: ['Node.js', 'Python', 'AWS', 'DynamoDB'],
        location: 'New York, NY',
        salary: '$90,000 - $130,000',
        createdAt: '2024-01-14T14:30:00Z'
    },
    {
        id: 'job-3',
        title: 'Full Stack Developer',
        company: 'StartupXYZ',
        description: 'Help us build the next big thing in fintech.',
        requirements: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
        location: 'Remote',
        salary: '$70,000 - $110,000',
        createdAt: '2024-01-13T09:15:00Z'
    }
];

export const mockMatchScores = [
    {
        id: 'match-1',
        jobId: 'job-1',
        jobTitle: 'Frontend Developer',
        candidateName: 'John Doe',
        resumeFileName: 'john_doe_resume.pdf',
        matchScore: 85,
        skills: ['React', 'JavaScript', 'HTML', 'CSS'],
        experience: '3 years',
        uploadedAt: '2024-01-16T11:30:00Z'
    },
    {
        id: 'match-2',
        jobId: 'job-1',
        jobTitle: 'Frontend Developer',
        candidateName: 'Jane Smith',
        resumeFileName: 'jane_smith_resume.pdf',
        matchScore: 92,
        skills: ['React', 'TypeScript', 'HTML', 'CSS', 'Redux'],
        experience: '5 years',
        uploadedAt: '2024-01-16T10:15:00Z'
    },
    {
        id: 'match-3',
        jobId: 'job-2',
        jobTitle: 'Backend Developer',
        candidateName: 'Mike Johnson',
        resumeFileName: 'mike_johnson_resume.pdf',
        matchScore: 78,
        skills: ['Node.js', 'Python', 'AWS'],
        experience: '2 years',
        uploadedAt: '2024-01-16T09:45:00Z'
    }
];

export default api;