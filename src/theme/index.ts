export const Colors = {
  background: '#121212',
  surface: '#1E1E1E',
  primary: '#FFD700', // Gold
  secondary: '#C5A000', // Darker Gold
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  error: '#FF5252',
  success: '#4CAF50',
  border: '#333333',
  card: '#1A1A1A',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  body: {
    fontSize: 16,
    color: Colors.text,
  },
  caption: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
} as const;
