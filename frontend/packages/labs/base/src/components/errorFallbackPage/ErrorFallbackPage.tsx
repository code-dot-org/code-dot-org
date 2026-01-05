import type {FunctionComponent} from 'react';

import {Button} from '@code-dot-org/component-library/button';

import moduleStyles from './errorFallbackPage.module.scss';

export interface ErrorUIProps {
  message?: string;
}

export const ErrorUI: FunctionComponent<ErrorUIProps> = ({message}) => (
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
        text="Reload Page"
        onClick={() => {
          location.reload();
        }}
        size="s"
      />
    </div>
  </div>
);

export type ErrorFallbackPageProps = ErrorUIProps;

const ErrorFallbackPage: FunctionComponent<ErrorFallbackPageProps> = ({
  message,
}) => (
  <div id="lab-container" className={moduleStyles.labContainer}>
    <ErrorUI message={message} />
  </div>
);

export default ErrorFallbackPage;
