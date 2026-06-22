import { createTheme } from '@mui/material/styles';

// Nambikkai Fund - Clean Modern Crowdfunding Theme
// Color Palette (exact match to reference):
// Primary: #2F7C7B (teal) - headers/sections
// Accent: #7FC6CC (light teal) - buttons/accent
// Background light: #EAF7F8 (very light teal)
// Text primary: #24343A (dark blue-gray)
// Text secondary: #7A8A91 (medium gray)
// Card: #FFFFFF (white)

export const createAppTheme = (direction = 'ltr') => createTheme({
  direction,
  palette: {
    mode: 'light',
    primary: {
      main: '#2F7C7B',
      light: '#4a9a98',
      dark: '#245555',
      contrastText: '#ffffff',
      50: '#E8F6F6',
      100: '#D1EDEC',
      200: '#B3DCDC',
      300: '#8FC6C6',
      400: '#6FB0B0',
      500: '#4A9A98',
      600: '#3A7E7D',
      700: '#2F7C7B',
      800: '#245555',
      900: '#1A3D3C',
    },
    secondary: {
      main: '#7FC6CC',
      light: '#A6DCE3',
      dark: '#5BA8B3',
      contrastText: '#24343A',
    },
    accent: {
      main: '#7FC6CC',
      light: '#A6DCE3',
      dark: '#5BA8B3',
      contrastText: '#24343A',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    info: {
      main: '#0284c7',
      light: '#38bdf8',
      dark: '#0369a1',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
      subtle: '#EAF7F8',
      elevated: '#ffffff',
      hero: '#EAF7F8',
      section: '#ffffff',
    },
    text: {
      primary: '#24343A',
      secondary: '#7A8A91',
      tertiary: '#A0B0B8',
      inverse: '#ffffff',
    },
    divider: 'rgba(36, 52, 58, 0.1)',
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: { xs: '2rem', sm: '2.5rem', md: '3.75rem' },
      letterSpacing: '-0.03em',
      lineHeight: 1.15,
      color: '#24343A',
    },
    h2: {
      fontWeight: 700,
      fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
      color: '#24343A',
    },
    h3: {
      fontWeight: 700,
      fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.25rem' },
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
      color: '#24343A',
    },
    h4: {
      fontWeight: 600,
      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
      letterSpacing: '0em',
      color: '#24343A',
    },
    h5: {
      fontWeight: 600,
      fontSize: { xs: '1.1rem', sm: '1.125rem', md: '1.25rem' },
      color: '#24343A',
    },
    h6: {
      fontWeight: 600,
      fontSize: { xs: '1rem', sm: '1rem', md: '1.125rem' },
      color: '#24343A',
    },
    body1: {
      fontSize: { xs: '0.95rem', sm: '1rem', md: '1.05rem' },
      lineHeight: 1.7,
      fontWeight: 400,
      letterSpacing: '0.01em',
      color: '#7A8A91',
    },
    body2: {
      fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' },
      lineHeight: 1.65,
      color: '#7A8A91',
    },
    button: {
      fontWeight: 700,
      textTransform: 'none',
      letterSpacing: '0.03em',
      fontSize: { xs: '0.9rem', sm: '1rem' },
    },
    subtitle1: {
      fontWeight: 500,
      letterSpacing: '0.01em',
      color: '#7A8A91',
    },
    subtitle2: {
      fontWeight: 500,
      letterSpacing: '0.005em',
      color: '#7A8A91',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 2px rgba(36, 52, 58, 0.04), 0 1px 1px rgba(36, 52, 58, 0.06)',
    '0 2px 4px rgba(36, 52, 58, 0.05), 0 1px 2px rgba(36, 52, 58, 0.04)',
    '0 4px 6px -1px rgba(36, 52, 58, 0.06), 0 2px 4px -1px rgba(36, 52, 58, 0.04)',
    '0 6px 8px -1px rgba(36, 52, 58, 0.08), 0 4px 6px -2px rgba(36, 52, 58, 0.05)',
    '0 8px 12px -1px rgba(36, 52, 58, 0.1), 0 6px 10px -2px rgba(36, 52, 58, 0.06)',
    '0 10px 14px -1px rgba(36, 52, 58, 0.12), 0 8px 12px -2px rgba(36, 52, 58, 0.08)',
    '0 12px 16px -1px rgba(36, 52, 58, 0.14), 0 10px 14px -2px rgba(36, 52, 58, 0.1)',
    '0 14px 20px -1px rgba(36, 52, 58, 0.16), 0 12px 18px -2px rgba(36, 52, 58, 0.12)',
    '0 16px 24px -2px rgba(36, 52, 58, 0.18), 0 14px 22px -3px rgba(36, 52, 58, 0.14)',
    '0 20px 28px -2px rgba(36, 52, 58, 0.2), 0 18px 28px -3px rgba(36, 52, 58, 0.16)',
  ],
  components: {
    MuiButton: {
      defaultProps: {
        variant: 'contained',
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: 700,
          letterSpacing: '0.02em',
          transition: 'all 0.25s ease',
          boxShadow: '0 2px 8px rgba(47, 124, 123, 0.15)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(47, 124, 123, 0.25)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #7FC6CC 0%, #5BA8B3 100%)',
          color: '#24343A',
          '&:hover': {
            background: 'linear-gradient(135deg, #A6DCE3 0%, #7FC6CC 100%)',
            boxShadow: '0 6px 16px rgba(47, 124, 123, 0.25)',
          },
        },
        outlined: {
          borderWidth: 2,
          borderColor: '#7FC6CC',
          color: '#2F7C7B',
          '&:hover': {
            borderWidth: 2,
            backgroundColor: 'rgba(47, 124, 123, 0.04)',
            boxShadow: '0 2px 8px rgba(47, 124, 123, 0.12)',
          },
        },
        text: {
          color: '#2F7C7B',
          '&:hover': {
            backgroundColor: 'rgba(47, 124, 123, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid rgba(36, 52, 58, 0.08)',
          boxShadow: '0 2px 8px rgba(36, 52, 58, 0.06)',
          transition: 'all 0.3s ease',
          backgroundColor: '#ffffff',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(36, 52, 58, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
          borderImage: 'none',
          backgroundColor: '#ffffff',
        },
        elevation1: {
          boxShadow: '0 2px 6px rgba(36, 52, 58, 0.06)',
        },
        elevation2: {
          boxShadow: '0 4px 10px rgba(36, 52, 58, 0.08)',
        },
        elevation3: {
          boxShadow: '0 8px 20px rgba(36, 52, 58, 0.12)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'medium',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: '#ffffff',
            '&.Mui-focused fieldset': {
              borderColor: '#2F7C7B',
              borderWidth: 2,
            },
            '&:hover fieldset': {
              borderColor: '#7FC6CC',
            },
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          padding: '14px 16px',
          fontSize: '1rem',
          letterSpacing: '0.01em',
          color: '#24343A',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 2px rgba(36, 52, 58, 0.06)',
          backdropFilter: 'blur(16px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderBottom: '1px solid rgba(36, 52, 58, 0.08)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: '6px 0 24px rgba(36, 52, 58, 0.08)',
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.8rem',
          letterSpacing: '0.02em',
          borderRadius: 8,
          backgroundColor: '#EAF7F8',
          color: '#2F7C7B',
        },
      },
    },
    MuiLink: {
      defaultProps: {
        underline: 'none',
      },
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          color: '#7A8A91',
          '&:hover': {
            color: '#2F7C7B',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 500,
          fontSize: '0.95rem',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 6px rgba(36, 52, 58, 0.1)',
          border: '2px solid rgba(255, 255, 255, 0.9)',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: '#EAF7F8',
        },
        bar: {
          borderRadius: 6,
          transition: 'width 0.6s ease',
          background: 'linear-gradient(90deg, #7FC6CC 0%, #5BA8B3 100%)',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          '&:last-child': {
            paddingBottom: 20,
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h1: {
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
        },
        h2: {
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
        },
        h3: {
          letterSpacing: '-0.01em',
        },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          '&.Mui-disabled': {
            boxShadow: 'none',
          },
        },
      },
    },
  },
});

export default createAppTheme();