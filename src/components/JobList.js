import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Collapse,
    Divider,
    Alert,
    CircularProgress,
    Snackbar
} from '@mui/material';
import {
    Add,
    LocationOn,
    AttachMoney,
    Schedule,
    Close,
    ExpandMore,
    ExpandLess,
    Error,
    Warning
} from '@mui/icons-material';
import { getJobs, createJob, mockJobs, checkBackendHealth } from '../services/api';
import config from '../config/api.config';

const JobList = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [backendAvailable, setBackendAvailable] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [expandedJob, setExpandedJob] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [newJob, setNewJob] = useState({
        title: '',
        company: '',
        description: '',
        requirements: '',
        location: '',
        salary: ''
    });

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            setLoading(true);
            
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
            setLoading(false);
        }
    };

    const handleCreateJob = async () => {
        try {
            const requirements = newJob.requirements.split(',').map(req => req.trim()).filter(req => req);
            const jobData = {
                title: newJob.title,
                company: newJob.company,
                description: newJob.description,
                requirements,
                location: newJob.location,
                salary: newJob.salary
            };

            if (backendAvailable) {
                // Create job in serverless backend
                const response = await createJob(jobData);
                const createdJob = response.data ? JSON.parse(response.data.body) : [];
                setJobs([createdJob, ...jobs]);
                showSnackbar('Job created successfully!', 'success');
            } else {
                // Create mock job locally
                const mockJob = {
                    ...jobData,
                    id: `job-${Date.now()}`,
                    createdAt: new Date().toISOString()
                };
                setJobs([mockJob, ...jobs]);
                showSnackbar('Job created (mock mode - backend unavailable)', 'warning');
            }

            // Reset form
            setNewJob({
                title: '',
                company: '',
                description: '',
                requirements: '',
                location: '',
                salary: ''
            });
            setOpenDialog(false);
        } catch (error) {
            console.error('Error creating job:', error);
            showSnackbar('Failed to create job. Please try again.', 'error');
        }
    };

    const handleExpandJob = (jobId) => {
        setExpandedJob(expandedJob === jobId ? null : jobId);
    };

    const showSnackbar = (message, severity = 'info') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" gutterBottom>
                        Job Positions
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Browse and manage available job positions
                    </Typography>
                    {!backendAvailable && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Warning fontSize="small" />
                                Backend unavailable - using mock data
                            </Box>
                        </Alert>
                    )}
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenDialog(true)}
                >
                    Add New Job
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : jobs.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No jobs found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {backendAvailable ? 'Create your first job position to get started.' : 'Backend is unavailable. Please check your connection.'}
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {jobs.map((job) => (
                        <Grid item xs={12} key={job.id}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" gutterBottom>
                                                {job.title}
                                            </Typography>
                                            <Typography variant="subtitle1" color="primary" gutterBottom>
                                                {job.company}
                                            </Typography>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <LocationOn fontSize="small" color="action" />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {job.location}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <AttachMoney fontSize="small" color="action" />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {job.salary}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Schedule fontSize="small" color="action" />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {new Date(job.createdAt).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                {job.description}
                                            </Typography>

                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                                                {job.requirements.slice(0, 3).map((req, index) => (
                                                    <Chip key={index} label={req} size="small" variant="outlined" />
                                                ))}
                                                {job.requirements.length > 3 && (
                                                    <Chip
                                                        label={`+${job.requirements.length - 3} more`}
                                                        size="small"
                                                        variant="outlined"
                                                        color="primary"
                                                    />
                                                )}
                                            </Box>
                                        </Box>

                                        <IconButton
                                            onClick={() => handleExpandJob(job.id)}
                                            size="small"
                                        >
                                            {expandedJob === job.id ? <ExpandLess /> : <ExpandMore />}
                                        </IconButton>
                                    </Box>

                                    <Collapse in={expandedJob === job.id}>
                                        <Divider sx={{ my: 2 }} />
                                        <Typography variant="subtitle2" gutterBottom>
                                            Full Requirements:
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                                            {job.requirements.map((req, index) => (
                                                <Chip key={index} label={req} size="small" />
                                            ))}
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button variant="outlined" size="small">
                                                View Applications
                                            </Button>
                                            <Button variant="outlined" size="small">
                                                Edit Job
                                            </Button>
                                        </Box>
                                    </Collapse>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Create Job Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Create New Job Position</Typography>
                        <IconButton onClick={() => setOpenDialog(false)}>
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Job Title"
                                value={newJob.title}
                                onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Company"
                                value={newJob.company}
                                onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Location"
                                value={newJob.location}
                                onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Salary Range"
                                value={newJob.salary}
                                onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                                placeholder="e.g., $80,000 - $120,000"
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Requirements (comma-separated)"
                                value={newJob.requirements}
                                onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                                placeholder="e.g., React, JavaScript, Node.js"
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Job Description"
                                value={newJob.description}
                                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                                multiline
                                rows={4}
                                required
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button 
                        onClick={handleCreateJob} 
                        variant="contained"
                        disabled={!newJob.title || !newJob.company || !newJob.description}
                    >
                        Create Job
                    </Button>
                </DialogActions>
            </Dialog>

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

export default JobList; 