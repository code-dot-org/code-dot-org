import type {ITheme} from '@xterm/xterm';

// xterm.js console themes. Ported from apps/src/codebridge/Console/consoleThemes.ts.
// Dark leans on xterm's defaults (black background, white text), overriding a
// couple of colors for contrast; light inverts to a white background.

export const darkTheme: ITheme = {
  red: '#FF69B4',
  brightBlack: '#b2b2b2',
};

export const lightTheme: ITheme = {
  background: '#FFFFFF',
  foreground: '#000000',
  cursor: '#000000',
  cursorAccent: '#FFFFFF',
  selectionBackground: '#ADD6FF',
};
