import {ThemeProvider as MuiThemeProvider} from '@mui/material/styles';
import React, {ReactElement} from 'react';
import ReactDOM from 'react-dom';

import theme from '@cdo/apps/themes/code.org';

/**
 * Global bootstrapper function that wraps rendered DOM trees with configured providers
 *
 * This function allows each webpack endpoint to consistently apply global wrappers
 * around their rendered components.
 *
 * @param component - The React component to render
 * @param container - The container element or selector to render into
 */
export function bootstrap(
  component: ReactElement,
  container: Element | string
): void {
  const containerElement =
    typeof container === 'string'
      ? document.querySelector(container)
      : container;

  if (!containerElement) {
    throw new Error(
      `GlobalBootstrapper: Could not find container element: ${container}`
    );
  }
  const wrappedComponent = (
    <MuiThemeProvider theme={theme}>{component}</MuiThemeProvider>
  );

  ReactDOM.render(wrappedComponent, containerElement);
}

export default bootstrap;
