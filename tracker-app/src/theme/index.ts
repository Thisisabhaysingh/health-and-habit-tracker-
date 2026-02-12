import { MD3LightTheme, configureFonts } from 'react-native-paper';

import { palette } from './palette';

const fontConfig = {
  displayLarge: {
    fontFamily: 'SpaceMono',
    fontWeight: '400',
    fontSize: 57,
    lineHeight: 64,
    letterSpacing: 0,
  },
} satisfies Parameters<typeof configureFonts>[0]['config'];

export const appTheme = {
  ...MD3LightTheme,
  roundness: 16,
  colors: {
    ...MD3LightTheme.colors,
    primary: palette.primary,
    secondary: palette.secondary,
    background: palette.background,
    surface: palette.surface,
    onSurface: palette.text,
    outline: palette.muted,
    error: palette.danger,
  },
  fonts: configureFonts({ config: fontConfig }),
};
