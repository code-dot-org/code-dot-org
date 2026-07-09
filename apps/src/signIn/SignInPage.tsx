import {Typography} from '@mui/material';
import React from 'react';

// Generic error boundary; the component library doesn't ship one yet.
import ErrorBoundary from '@cdo/apps/lab2/ErrorBoundary';

import SignInForm, {SignInFormProps} from './SignInForm';

import style from './signInStyles.module.scss';

// Untyped CommonJS module; require() keeps it typed as `any`. logError routes
// to the observability package (Observability.recordError).

const logToCloud = require('@cdo/apps/logToCloud');

export interface SignInPageProps extends SignInFormProps {
  title: string;
}

/**
 * The left column of the sign-in page: the page title + the sign-in form, in a
 * single React root (rather than separate roots per element).
 *
 * It replaces a previously server-rendered HAML form, so it is wrapped in an
 * error boundary: if the React tree throws, we report to observability and show
 * a fallback that points the user at a refresh rather than a blank column with
 * no way to sign in.
 */
const SignInPage: React.FunctionComponent<SignInPageProps> = ({
  title,
  ...formProps
}) => (
  <ErrorBoundary
    onError={error => logToCloud.logError(error)}
    fallback={
      <Typography variant="body2">
        Something went wrong loading the sign-in form. Please refresh the page.
      </Typography>
    }
  >
    <div className={style.leftColumn}>
      <Typography variant="h2" component="h2">
        {title}
      </Typography>
      <SignInForm {...formProps} />
    </div>
  </ErrorBoundary>
);

export default SignInPage;
