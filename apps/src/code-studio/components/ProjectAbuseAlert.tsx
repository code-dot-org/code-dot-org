import Alert from '@code-dot-org/component-library/alert';
import Link from '@code-dot-org/component-library/link';
import React from 'react';

import moduleStyles from './project-abuse-alert.module.scss';

const TERMS_OF_SERVICE_URL = 'http://code.org/tos';
const SUPPORT_REQUEST_URL =
  'https://support.code.org/hc/en-us/requests/new?&description=';

const ProjectAbuseAlert: React.FunctionComponent<{shareUrl: string}> = ({
  shareUrl,
}) => (
  <Alert
    type="danger"
    size="xs"
    className={moduleStyles.alert}
    text={
      <>
        <div>
          This project has been reported for violating CodeAI's{' '}
          <Link
            href={TERMS_OF_SERVICE_URL}
            text="Terms of Service"
            external
            openInNewTab
            size="xs"
          />{' '}
          and cannot be shared with others.
        </div>
        <div>
          If you believe this to be an error, please{' '}
          <Link
            href={`${SUPPORT_REQUEST_URL}${encodeURIComponent(
              `Abuse error for project at url: ${shareUrl}`
            )}`}
            text="contact us"
            external
            openInNewTab
            size="xs"
          />
          .
        </div>
      </>
    }
  />
);

export default ProjectAbuseAlert;
