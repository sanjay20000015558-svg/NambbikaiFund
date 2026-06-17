import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  ListItemIcon,
  TextField,
  InputAdornment,
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', dir: 'ltr' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', dir: 'ltr' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', dir: 'ltr' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', dir: 'ltr' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', dir: 'ltr' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', dir: 'ltr' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇮🇳', dir: 'rtl' },
];

const LanguageSelector = ({ onLanguageChange, currentLanguage, variant = 'icon' }) => {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [recentLanguages, setRecentLanguages] = React.useState(() => {
    const stored = localStorage.getItem('recent_languages');
    return stored ? JSON.parse(stored) : [];
  });
  const [favoriteLanguages, setFavoriteLanguages] = React.useState(() => {
    const stored = localStorage.getItem('favorite_languages');
    return stored ? JSON.parse(stored) : [];
  });

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setSearchQuery('');
  };

  const handleLanguageSelect = (code) => {
    const lang = languages.find(l => l.code === code);
    if (lang) {
      document.documentElement.setAttribute('dir', lang.dir);
      document.documentElement.lang = code;
    }
    
    i18n.changeLanguage(code);
    localStorage.setItem('nambikkai_lang', code);
    
    const updatedRecent = [code, ...recentLanguages.filter(l => l !== code)].slice(0, 5);
    setRecentLanguages(updatedRecent);
    localStorage.setItem('recent_languages', JSON.stringify(updatedRecent));
    
    if (onLanguageChange) {
      onLanguageChange(code);
    }
    // Close menu after language change
    setTimeout(() => setAnchorEl(null), 100);
  };
  const toggleFavorite = (code) => {
    const updatedFavorites = favoriteLanguages.includes(code)
      ? favoriteLanguages.filter(l => l !== code)
      : [...favoriteLanguages, code].slice(0, 10);
    setFavoriteLanguages(updatedFavorites);
    localStorage.setItem('favorite_languages', JSON.stringify(updatedFavorites));
  };

  const currentLang = languages.find(l => l.code === (currentLanguage || i18n.language)) || languages[0];

  const filteredLanguages = languages
    .filter(lang => 
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (favoriteLanguages.includes(a.code) && !favoriteLanguages.includes(b.code)) return -1;
      if (!favoriteLanguages.includes(a.code) && favoriteLanguages.includes(b.code)) return 1;
      if (recentLanguages.includes(a.code) && !recentLanguages.includes(b.code)) return -1;
      if (!recentLanguages.includes(a.code) && recentLanguages.includes(b.code)) return 1;
      return a.name.localeCompare(b.name);
    });

  if (variant === 'icon') {
    return (
      <>
        <IconButton color="inherit" onClick={handleClick} aria-label="change language" sx={{ color: 'black' }}>
          <LanguageIcon sx={{ color: 'black' }} />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: {
              maxHeight: 500,
              minWidth: 280,
              borderRadius: 2,
            }
          }}
        >
          <Box sx={{ p: 1 }}>
            <TextField
              autoFocus
              placeholder="Search languages..."
              size="small"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'black' }} />
                  </InputAdornment>
                ),
              }}
              inputProps={{
                sx: { color: 'black' }
              }}
            />
          </Box>
          
          {recentLanguages.length > 0 && (
            <>
              <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'black' }}>
                Recently Used
              </Typography>
              {recentLanguages.map(code => {
                const lang = languages.find(l => l.code === code);
                if (!lang || !filteredLanguages.find(l => l.code === code)) return null;
                return (
                  <MenuItem key={code} onClick={() => handleLanguageSelect(code)} selected={code === currentLang.code}>
                    <ListItemIcon>
                      <Box sx={{ width: 24, textAlign: 'center' }}>{lang.flag}</Box>
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ flexGrow: 1, color: 'black' }}>
                      {lang.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'black' }}>
                      {lang.nativeName}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(code); }}
                      sx={{ ml: 1 }}
                    >
                      <Box component="span" sx={{ color: favoriteLanguages.includes(code) ? 'primary.main' : 'grey.400', fontSize: 16 }}>
                        ★
                      </Box>
                    </IconButton>
                  </MenuItem>
                );
              })}
              <Box component="hr" sx={{ my: 1, mx: 2, borderColor: 'divider' }} />
            </>
          )}

          {favoriteLanguages.length > 0 && (
            <>
              <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'black' }}>
                Favorites
              </Typography>
              {favoriteLanguages.filter(code => !recentLanguages.includes(code)).map(code => {
                const lang = languages.find(l => l.code === code);
                if (!lang || !filteredLanguages.find(l => l.code === code)) return null;
                return (
                  <MenuItem key={code} onClick={() => handleLanguageSelect(code)} selected={code === currentLang.code}>
                    <ListItemIcon>
                      <Box sx={{ width: 24, textAlign: 'center' }}>{lang.flag}</Box>
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ flexGrow: 1, color: 'black' }}>
                      {lang.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'black' }}>
                      {lang.nativeName}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(code); }}
                      sx={{ ml: 1 }}
                    >
                      <Box component="span" sx={{ color: 'primary.main', fontSize: 16 }}>★</Box>
                    </IconButton>
                  </MenuItem>
                );
              })}
              <Box component="hr" sx={{ my: 1, mx: 2, borderColor: 'divider' }} />
            </>
          )}

          <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'black' }}>
            All Languages ({filteredLanguages.length})
          </Typography>
          {filteredLanguages.map((lang) => (
            <MenuItem key={lang.code} onClick={() => handleLanguageSelect(lang.code)} selected={lang.code === currentLang.code}>
              <ListItemIcon>
                <Box sx={{ width: 24, textAlign: 'center' }}>{lang.flag}</Box>
              </ListItemIcon>
              <Typography variant="body2" sx={{ flexGrow: 1, color: 'black' }}>
                {lang.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'black' }}>
                {lang.nativeName}
              </Typography>
<IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(lang.code); }}
                    sx={{ ml: 1 }}
                  >
                    <Box component="span" sx={{ color: favoriteLanguages.includes(lang.code) ? 'primary.main' : 'grey.400', fontSize: 16 }}>
                      ★
                    </Box>
                  </IconButton>
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }

  return (
    <>
      <TextField
        select
        value={currentLang.code}
        onChange={(e) => handleLanguageSelect(e.target.value)}
        label="Language"
        size="small"
        SelectProps={{
          MenuProps: {
            PaperProps: {
              sx: { maxHeight: 400, minWidth: 280 },
            },
          },
        }}
      >
        {filteredLanguages.map((lang) => (
          <MenuItem key={lang.code} value={lang.code}>
            <Box sx={{ width: 24, textAlign: 'center', mr: 1 }}>{lang.flag}</Box>
            {lang.name} ({lang.nativeName})
          </MenuItem>
        ))}
      </TextField>
    </>
  );
};

export default LanguageSelector;
export { languages };