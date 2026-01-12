import '@code-dot-org/component-library-styles/fontVariables.css';
import {CdoTheme} from '@code-dot-org/component-library/themes';
import {ThemeProvider as MuiThemeProvider} from '@mui/material/styles';
import React, {ReactElement} from 'react';
import ReactDOM from 'react-dom';

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

  ReactDOM.render(
    <MuiThemeProvider theme={CdoTheme}>{component}</MuiThemeProvider>,
    containerElement
  );
}
