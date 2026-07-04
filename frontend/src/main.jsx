import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ThemeContextProvider } from './contexts/ThemeContext.jsx';
import './index.css';

const muiTheme = createTheme({
  palette: {
    primary: { main: '#2563EB' },
    secondary: { main: '#0EA5E9' },
  },
  typography: {
    fontFamily: '"Inter", system-ui, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: '8px', fontWeight: 600 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: '12px' },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeContextProvider>
        <ThemeProvider theme={muiTheme}>
          <CssBaseline />
          <AuthProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1E293B',
                  color: '#F8FAFC',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                },
                success: {
                  iconTheme: { primary: '#14B8A6', secondary: '#F8FAFC' },
                },
                error: {
                  iconTheme: { primary: '#EF4444', secondary: '#F8FAFC' },
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </ThemeContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
