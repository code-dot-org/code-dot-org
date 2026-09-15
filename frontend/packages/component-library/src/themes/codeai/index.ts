import {createBrandTheme} from '../createBrandTheme';

/**
 * CodeAI MUI theme.
 *
 * Palette values come from the CADS brand-purple ramp
 * (component-library-styles/primitiveColors_codeAi.css): main is
 * purple-50, light purple-30, dark purple-70. Keep in sync with that
 * file when design re-exports it.
 *
 * Typography and component-level style overrides are inherited from the
 * Code.org theme via deep merge; only the palette differs.
 */
const theme = createBrandTheme({
  main: '#4C42CF', // --brand-purple-50
  light: '#928CEF', // --brand-purple-30
  dark: '#3228B7', // --brand-purple-70
  contrastText: '#FFFFFF',
});

export default theme;
