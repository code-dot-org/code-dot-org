import '@code-dot-org/component-library-styles/colors.css';
import '@code-dot-org/component-library-styles/fontVariables.css';
import '@code-dot-org/component-library-styles/primitiveColors.css';
import {CdoTheme} from '@code-dot-org/component-library/themes';
import {ThemeProvider as MuiThemeProvider} from '@mui/material/styles';
import React, {ReactElement} from 'react';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';

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
  container: Element | string,
  options?: {flushSync?: boolean}
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

  const root = createRoot(containerElement);
  const element = (
    <MuiThemeProvider theme={CdoTheme}>{component}</MuiThemeProvider>
  );

  if (options?.flushSync) {
    flushSync(() => {
      root.render(element);
    });
  } else {
    root.render(element);
  }
}
