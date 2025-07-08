import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

// Import components
import ResumeUpload from './components/ResumeUpload';
import JobList from './components/JobList';
import MatchScores from './components/MatchScores';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Resume Parser & Job Matcher
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/"
                >
                  Upload Resume
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/jobs"
                >
                  Jobs
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/matches"
                >
                  Match Scores
                </Button>
              </Box>
            </Toolbar>
          </AppBar>

          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Routes>
              <Route path="/" element={<ResumeUpload />} />
              <Route path="/jobs" element={<JobList />} />
              <Route path="/matches" element={<MatchScores />} />
            </Routes>
          </Container>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
