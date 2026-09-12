import type {FunctionComponent} from 'react';

import {Button} from '@code-dot-org/component-library/button';

import moduleStyles from './errorFallbackPage.module.scss';

export interface ErrorUIProps {
  message?: string;
  /**
   * Recovery action for the button. Defaults to a full page reload; a host
   * boundary may pass an in-place retry (reset failed queries and re-render)
   * instead.
   */
  onReload?: () => void;
}

export const ErrorUI: FunctionComponent<ErrorUIProps> = ({
  message,
  onReload,
}) => (
  <div id="page-error-container" className={moduleStyles.pageErrorContainer}>
    <div data-theme="Light" id="page-error" className={moduleStyles.pageError}>
      <img
        className={moduleStyles.pageErrorImage}
        src="/images/sad-bee-avatar.png"
        alt=""
      />
      <div>An error occurred. Please reload the page and try again.</div>
      {message && (
        <div className={moduleStyles.pageErrorMessage}>({message})</div>
      )}
      <Button
        text={onReload ? 'Try again' : 'Reload Page'}
        onClick={onReload ?? (() => location.reload())}
        size="s"
      />
    </div>
  </div>
);

export type ErrorFallbackPageProps = ErrorUIProps;

const ErrorFallbackPage: FunctionComponent<ErrorFallbackPageProps> = ({
  message,
  onReload,
}) => (
  <div id="lab-container" className={moduleStyles.labContainer}>
    <ErrorUI message={message} onReload={onReload} />
  </div>
);

export default ErrorFallbackPage;
