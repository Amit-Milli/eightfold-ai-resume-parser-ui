import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Paper,
    Grid,
    Chip,
    Divider,
    TextField,
    Snackbar
} from '@mui/material';
import { CloudUpload, Description, Work, Warning, Error } from '@mui/icons-material';
import { getJobs, uploadResume, mockJobs, checkBackendHealth } from '../services/api';
import config from '../config/api.config';

const ResumeUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedJob, setSelectedJob] = useState('');
    const [candidateEmail, setCandidateEmail] = useState('');
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [backendAvailable, setBackendAvailable] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [dragActive, setDragActive] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            setJobsLoading(true);
            
            // Check if backend is available
            const isBackendAvailable = await checkBackendHealth();
            setBackendAvailable(isBackendAvailable);

            if (isBackendAvailable) {
                // Load jobs from serverless backend
                const response = await getJobs();
                setJobs(JSON.parse(response.data.body) || []);
            } else if (config.useMockFallback) {
                // Fallback to mock data
                console.warn('Backend unavailable, using mock data');
                setJobs(mockJobs);
            } else {
                setJobs([]);
            }
        } catch (error) {
            console.error('Error loading jobs:', error);
            setBackendAvailable(false);
            
            if (config.useMockFallback) {
                console.warn('Using mock data due to backend error');
                setJobs(mockJobs);
            } else {
                setJobs([]);
            }
            
            showSnackbar('Failed to load jobs. Please check your connection.', 'error');
        } finally {
            setJobsLoading(false);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            setSelectedFile(file);
            setMessage({ type: 'success', text: `Selected: ${file.name}` });
            event.target.value = null;
        } else {
            setMessage({ type: 'error', text: 'Please select a valid PDF file' });
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') {
            setSelectedFile(file);
            setMessage({ type: 'success', text: `Dropped: ${file.name}` });
        } else {
            setMessage({ type: 'error', text: 'Please drop a valid PDF file' });
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !selectedJob || !candidateEmail) {
            setMessage({ 
                type: 'error', 
                text: 'Please select a file, job, and provide your email address' 
            });
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(candidateEmail)) {
            setMessage({ type: 'error', text: 'Please enter a valid email address' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            if (backendAvailable) {
                // Upload to serverless backend
                const response = await uploadResume(selectedFile, selectedJob, candidateEmail);
                
                setMessage({
                    type: 'success',
                    text: 'Resume uploaded successfully! Match score will be calculated shortly.'
                });
                
                showSnackbar('Resume uploaded successfully! Processing will begin shortly.', 'success');
                
                // Reset form
                setSelectedFile(null);
                setSelectedJob('');
                setCandidateEmail('');
            } else {
                // Mock upload for demo
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                setMessage({
                    type: 'warning',
                    text: 'Resume uploaded (mock mode - backend unavailable). Match score will be calculated shortly.'
                });
                
                showSnackbar('Resume uploaded (mock mode - backend unavailable)', 'warning');
                
                // Reset form
                setSelectedFile(null);
                setSelectedJob('');
                setCandidateEmail('');
            }
        } catch (error) {
            console.error('Upload error:', error);
            const errorMessage = error.response?.data?.error || 'Failed to upload resume. Please try again.';
            setMessage({ type: 'error', text: errorMessage });
            showSnackbar(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message, severity = 'info') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const selectedJobData = Array.isArray(jobs) ? jobs.find(job => job.id === selectedJob) : null;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Upload Resume
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Upload your resume to apply for a specific job position
            </Typography>

            {!backendAvailable && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Warning fontSize="small" />
                        Backend unavailable - using mock data
                    </Box>
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* File Upload Section */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                <CloudUpload sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Resume Upload
                            </Typography>

                            <Box
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                sx={{
                                    border: '2px dashed',
                                    borderColor: dragActive ? 'primary.main' : 'grey.300',
                                    borderRadius: 2,
                                    p: 4,
                                    textAlign: 'center',
                                    backgroundColor: dragActive ? 'action.hover' : 'background.paper',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        backgroundColor: 'action.hover'
                                    }
                                }}
                                onClick={() => document.getElementById('file-input').click()}
                            >
                                <input
                                    id="file-input"
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                />

                                <Description sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    {selectedFile ? selectedFile.name : 'Drop your resume here or click to browse'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Only PDF files are supported (max 10MB)
                                </Typography>
                            </Box>

                            {message.text && (
                                <Alert severity={message.type} sx={{ mt: 2 }}>
                                    {message.text}
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Job Selection Section */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                <Work sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Application Details
                            </Typography>

                            {jobsLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : jobs.length === 0 ? (
                                <Alert severity="info">
                                    No jobs available. Please create jobs first.
                                </Alert>
                            ) : (
                                <>
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        type="email"
                                        value={candidateEmail}
                                        onChange={(e) => setCandidateEmail(e.target.value)}
                                        placeholder="your.email@example.com"
                                        sx={{ mb: 3 }}
                                        required
                                    />

                                    <FormControl fullWidth sx={{ mb: 3 }}>
                                        <InputLabel>Choose a job</InputLabel>
                                        <Select
                                            value={selectedJob}
                                            label="Choose a job"
                                            onChange={(e) => setSelectedJob(e.target.value)}
                                        >
                                            {jobs.map((job) => (
                                                <MenuItem key={job.id} value={job.id}>
                                                    {job.title} - {job.company}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    {selectedJobData && (
                                        <Paper variant="outlined" sx={{ p: 2 }}>
                                            <Typography variant="subtitle1" gutterBottom>
                                                {selectedJobData.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                {selectedJobData.company} • {selectedJobData.location}
                                            </Typography>
                                            <Typography variant="body2" sx={{ mb: 2 }}>
                                                {selectedJobData.description}
                                            </Typography>
                                            <Divider sx={{ my: 1 }} />
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Requirements:
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selectedJobData.requirements.map((req, index) => (
                                                    <Chip key={index} label={req} size="small" variant="outlined" />
                                                ))}
                                            </Box>
                                        </Paper>
                                    )}

                                    <Button
                                        variant="contained"
                                        fullWidth
                                        size="large"
                                        onClick={handleUpload}
                                        disabled={!selectedFile || !selectedJob || !candidateEmail || loading}
                                        sx={{ mt: 3 }}
                                    >
                                        {loading ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CircularProgress size={20} color="inherit" />
                                                Uploading...
                                            </Box>
                                        ) : (
                                            'Upload Resume'
                                        )}
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ResumeUpload; 