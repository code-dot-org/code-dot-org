import {
  CssBaseline,
  GlobalStyles,
  StyledEngineProvider,
  ThemeProvider,
} from '@mui/material';
import {Decorator, StoryContext} from '@storybook/react-vite';
import {useEffect} from 'react';

import {
  CdoTheme,
  CodeaiTheme,
  CodeaiAuditTheme,
} from '@code-dot-org/component-library/themes';

/**
 * Default brand for stories, matching the production default-brand DCDO key
 * (Cdo::Brand::BRAND_CODEAI). Renders identically to the pre-brand-switcher
 * Storybook, since 'code'/'codeai' resolve to the :root legacy tokens.
 */
export const DEFAULT_BRAND = 'codeai';

/**
 * MUI theme for a brand code, so palette-driven MUI components stay in step
 * with the CSS token brand set by data-brand. Mirrors getMuiThemeForBrand in
 * apps/src/util/brand.ts: only codeai-next / codeai-audit carry their own
 * theme; every other brand uses the legacy CdoTheme.
 */
function muiThemeForBrand(brand: string) {
  if (brand === 'codeai-next') {
    return CodeaiTheme;
  }
  if (brand === 'codeai-audit') {
    return CodeaiAuditTheme;
  }
  return CdoTheme;
}

// Mirror the studio app: MUI's emotion styles go in an @layer so unlayered CSS
// (the header's .module.scss) overrides them without specificity hacks. Keeps
// Storybook (and Eyes) faithful to how the app renders the header.
const cssLayerOrder = (
  <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
);

/**
 * Applies the brand chosen in the "Brand" toolbar to every story:
 *
 *  - writes data-brand onto the preview <html>, the element that
 *    component-library-styles/brandOverrides.css scopes its token blocks
 *    against ([data-brand='codeai-next'] / [data-brand='codeai-audit']);
 *    'code'/'codeai' have no scoped block and fall through to the :root
 *    legacy defaults.
 *  - provides the matching MUI theme so palette-driven MUI components follow.
 *
 * The attribute is set in an effect that runs inside the story's own frame
 * (the canvas iframe, or a non-inline docs iframe), so every rendered story
 * gets it. Stories opt out of the MUI wrapper with `parameters.useMui = false`;
 * data-brand still applies so their CSS tokens rebrand.
 */
const BrandDecorator: Decorator = (Story, context: StoryContext) => {
  const brand = (context.globals.brand as string | undefined) ?? DEFAULT_BRAND;

  useEffect(() => {
    document.documentElement.setAttribute('data-brand', brand);
  }, [brand]);

  const useMui = context.parameters?.useMui ?? true;
  if (!useMui) {
    // Still branded via data-brand above; just skip the MUI theme wrapper.
    return <Story />;
  }

  return (
    <StyledEngineProvider enableCssLayer>
      {cssLayerOrder}
      <ThemeProvider theme={muiThemeForBrand(brand)}>
        <CssBaseline />
        <Story />
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default BrandDecorator;
