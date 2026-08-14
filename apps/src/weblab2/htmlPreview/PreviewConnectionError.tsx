import Link from '@code-dot-org/component-library/link';
import {CodebridgeEmptyState} from '@codebridge/components/CodebridgeEmptyState';
import React from 'react';

const IT_REQUIREMENTS_URL = 'https://code.org/educate/it';

const PreviewConnectionError = () => {
  return (
    <CodebridgeEmptyState
      title="Unable to Load Preview"
      description={
        <>
          Your browser may be blocking the setup of Web Lab. You may need to
          adjust your firewall settings. See the{' '}
          <Link href={IT_REQUIREMENTS_URL} size="s" external openInNewTab>
            Technical requirements page
          </Link>{' '}
          for which site(s) you need to unblock. If you need assistance, please
          reach out to support@code.org.
        </>
      }
    />
  );
};

export default PreviewConnectionError;
