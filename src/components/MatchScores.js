import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    InputAdornment,
    Card,
    CardContent,
    Grid,
    LinearProgress,
    Alert,
    CircularProgress,
    Snackbar
} from '@mui/material';
import {
    Search,
    TrendingUp,
    Person,
    Work,
    Star,
    Warning,
    Error
} from '@mui/icons-material';
import { 
    getAllMatchScores, 
    getJobs, 
    mockMatchScores, 
    mockJobs, 
    checkBackendHealth 
} from '../services/api';
import config from '../config/api.config';

const MatchScores = () => {
    const [matchScores, setMatchScores] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [backendAvailable, setBackendAvailable] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filterJob, setFilterJob] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('matchScore');
    const [sortOrder, setSortOrder] = useState('desc');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            
            // Check if backend is available
            const isBackendAvailable = await checkBackendHealth();
            setBackendAvailable(isBackendAvailable);

            if (isBackendAvailable) {
                // Load data from serverless backend
                const [matchScoresResponse, jobsResponse] = await Promise.all([
                    getAllMatchScores(),
                    getJobs()
                ]);
                
                // Handle different response structures from serverless backend
                const scores = JSON.parse(matchScoresResponse.data.body).matchScores || [];
                const jobsData = JSON.parse(jobsResponse.data.body) || [];
                
                setMatchScores(scores);
                setJobs(jobsData);
            } else if (config.useMockFallback) {
                // Fallback to mock data
                console.warn('Backend unavailable, using mock data');
                setMatchScores(mockMatchScores);
                setJobs(mockJobs);
            } else {
                setMatchScores([]);
                setJobs([]);
            }
        } catch (error) {
            console.error('Error loading match scores data:', error);
            setBackendAvailable(false);
            
            if (config.useMockFallback) {
                console.warn('Using mock data due to backend error');
                setMatchScores(mockMatchScores);
                setJobs(mockJobs);
            } else {
                setMatchScores([]);
                setJobs([]);
            }
            
            showSnackbar('Failed to load match scores. Please check your connection.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'success';
        if (score >= 80) return 'primary';
        if (score >= 70) return 'warning';
        return 'error';
    };

    const getScoreLabel = (score) => {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Very Good';
        if (score >= 70) return 'Good';
        if (score >= 60) return 'Fair';
        return 'Poor';
    };

    const showSnackbar = (message, severity = 'info') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const filteredData = matchScores
        .filter(match => {
            const matchesJob = !filterJob || match.jobId === filterJob;
            const matchesSearch = !searchTerm ||
                match.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                match.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                match.resumeFileName?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesJob && matchesSearch;
        })
        .sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'matchScore':
                    comparison = a.matchScore - b.matchScore;
                    break;
                case 'candidateName':
                    comparison = (a.candidateName || '').localeCompare(b.candidateName || '');
                    break;
                case 'jobTitle':
                    comparison = (a.jobTitle || '').localeCompare(b.jobTitle || '');
                    break;
                case 'uploadedAt':
                    comparison = new Date(a.uploadedAt || 0) - new Date(b.uploadedAt || 0);
                    break;
                default:
                    comparison = 0;
            }
            return sortOrder === 'desc' ? -comparison : comparison;
        });

    const paginatedData = filteredData.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const averageScore = filteredData.length > 0
        ? (filteredData.reduce((sum, match) => sum + (match.matchScore || 0), 0) / filteredData.length).toFixed(1)
        : 0;

    const topMatches = filteredData
        .filter(match => (match.matchScore || 0) >= 80)
        .length;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Resume Match Scores
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                View and analyze resume match scores against job positions
            </Typography>

            {!backendAvailable && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Warning fontSize="small" />
                        Backend unavailable - using mock data
                    </Box>
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {/* Statistics Cards */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box>
                                            <Typography color="text.secondary" gutterBottom>
                                                Total Applications
                                            </Typography>
                                            <Typography variant="h4">
                                                {filteredData.length}
                                            </Typography>
                                        </Box>
                                        <Person color="primary" sx={{ fontSize: 40 }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box>
                                            <Typography color="text.secondary" gutterBottom>
                                                Average Score
                                            </Typography>
                                            <Typography variant="h4">
                                                {averageScore}%
                                            </Typography>
                                        </Box>
                                        <TrendingUp color="success" sx={{ fontSize: 40 }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box>
                                            <Typography color="text.secondary" gutterBottom>
                                                Top Matches (≥80%)
                                            </Typography>
                                            <Typography variant="h4">
                                                {topMatches}
                                            </Typography>
                                        </Box>
                                        <Star color="warning" sx={{ fontSize: 40 }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box>
                                            <Typography color="text.secondary" gutterBottom>
                                                Active Jobs
                                            </Typography>
                                            <Typography variant="h4">
                                                {jobs.length}
                                            </Typography>
                                        </Box>
                                        <Work color="info" sx={{ fontSize: 40 }} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Filters */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Filter by Job</InputLabel>
                                <Select
                                    value={filterJob}
                                    label="Filter by Job"
                                    onChange={(e) => setFilterJob(e.target.value)}
                                >
                                    <MenuItem value="">All Jobs</MenuItem>
                                    {Array.isArray(jobs) && jobs.map((job) => (
                                        <MenuItem key={job.id} value={job.id}>
                                            {job.title} - {job.company}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Sort By</InputLabel>
                                <Select
                                    value={sortBy}
                                    label="Sort By"
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <MenuItem value="matchScore">Match Score</MenuItem>
                                    <MenuItem value="candidateName">Candidate Name</MenuItem>
                                    <MenuItem value="jobTitle">Job Title</MenuItem>
                                    <MenuItem value="uploadedAt">Upload Date</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Sort Order</InputLabel>
                                <Select
                                    value={sortOrder}
                                    label="Sort Order"
                                    onChange={(e) => setSortOrder(e.target.value)}
                                >
                                    <MenuItem value="desc">Descending</MenuItem>
                                    <MenuItem value="asc">Ascending</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {/* Match Scores Table */}
                    {filteredData.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                No match scores found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {backendAvailable ? 'Upload resumes to see match scores.' : 'Backend is unavailable. Please check your connection.'}
                            </Typography>
                        </Box>
                    ) : (
                        <Paper>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Candidate</TableCell>
                                            <TableCell>Job Position</TableCell>
                                            <TableCell>Match Score</TableCell>
                                            <TableCell>Skills</TableCell>
                                            <TableCell>Experience</TableCell>
                                            <TableCell>Upload Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginatedData.map((match) => (
                                            <TableRow key={match.id}>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="subtitle2">
                                                            {match.candidateName || 'Unknown'}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {match.resumeFileName || 'No file'}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="subtitle2">
                                                        {match.jobTitle || 'Unknown'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box sx={{ width: '100%', mr: 1 }}>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={match.matchScore || 0}
                                                                color={getScoreColor(match.matchScore || 0)}
                                                                sx={{ height: 8, borderRadius: 4 }}
                                                            />
                                                        </Box>
                                                        <Typography variant="body2" sx={{ minWidth: 35 }}>
                                                            {match.matchScore || 0}%
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        label={getScoreLabel(match.matchScore || 0)}
                                                        size="small"
                                                        color={getScoreColor(match.matchScore || 0)}
                                                        sx={{ mt: 0.5 }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {(match.skills || []).slice(0, 3).map((skill, index) => (
                                                            <Chip
                                                                key={index}
                                                                label={skill}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                        ))}
                                                        {(match.skills || []).length > 3 && (
                                                            <Chip
                                                                label={`+${(match.skills || []).length - 3}`}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {match.experience || 'Not specified'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {match.uploadedAt ? new Date(match.uploadedAt).toLocaleDateString() : 'Unknown'}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                component="div"
                                count={filteredData.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </Paper>
                    )}
                </>
            )}

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

export default MatchScores; 