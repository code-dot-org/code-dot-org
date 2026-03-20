import '@code-dot-org/component-library-styles/colors.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import {ThemeProvider as MuiThemeProvider} from '@mui/material/styles';
import React, {ReactElement} from 'react';
import ReactDOM from 'react-dom';

import {getCurrentBrand, getMuiThemeForBrand} from './brand';

/**
 * Global bootstrapper function that wraps rendered DOM trees with configured providers
 *
 * This function allows each webpack endpoint to consistently apply global wrappers
 * around their rendered components.
 *
 * @param component - The React component to render
 * @param container - The container element or selector to render into
 */
export function createReactRoot(
  component: ReactElement,
  container: Element | string
): void {
  const containerElement =
    typeof container === 'string'
      ? document.querySelector(container)
      : container;

  if (!containerElement) {
    throw new Error(
      `createReactRoot: Could not find container element: ${container}`
    );
  }

  const brand = getCurrentBrand();

  // Expose the brand on <html> so CSS variable overrides in colors.css can
  // target [data-brand='codeai'] and swap the brand colour ramp.
  if (brand === 'codeai') {
    document.documentElement.dataset.brand = brand;
  } else {
    delete document.documentElement.dataset.brand;
  }

  const theme = getMuiThemeForBrand(brand);

  ReactDOM.render(
    <MuiThemeProvider theme={theme}>{component}</MuiThemeProvider>,
    containerElement
  );
}
