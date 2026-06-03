export const colors = {
  primary: '#c8a882', primaryHover: '#b8976e', primaryLight: '#f6f1eb',
  surface: '#f9f6f0', card: '#ffffff', muted: '#f0ebe4',
  text: '#2c2c2c', textSecondary: '#6b6258', textCaption: '#8a7a6a',
  positive: '#b95757', negative: '#8b9c7e', danger: '#c27b6b',
  faction: { fe: '#d4a04a', fo: '#7a9ca8', ve: '#8b5a4a', vo: '#6b7a5c' },
} as const;

export const spacing = {
  xs: '4px', sm: '8px', md: '12px', lg: '16px',
  xl: '24px', '2xl': '32px', '3xl': '48px',
} as const;

export const radius = { sm: '4px', md: '8px', lg: '12px', xl: '16px' } as const;

export const fontSize = {
  display: '32px', h1: '24px', h2: '18px',
  body: '16px', label: '14px', caption: '13px', micro: '11px',
} as const;

export const animation = {
  easeSpring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  easeFadeUp: 'cubic-bezier(0.16, 1, 0.3, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  fast: '150ms', normal: '300ms', slow: '2000ms',
} as const;
