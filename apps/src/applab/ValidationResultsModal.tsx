import {Heading3} from '@code-dot-org/component-library/typography';
import React from 'react';

import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import Spinner from '@cdo/apps/sharedComponents/Spinner';

/**
 * Renders a dialog displaying results of the App Lab Code Checker.
 */

export interface ValidationResultsModalProps {
  onClose: () => void;
  aiResponse: string | undefined;
}

const ValidationResultsModal: React.FunctionComponent<
  ValidationResultsModalProps
> = ({onClose, aiResponse}) => {
  return (
    <AccessibleDialog onClose={onClose}>
      <div>
        <Heading3>Results</Heading3>
        {!aiResponse && <Spinner />}
        {aiResponse && <p>{aiResponse}</p>}
      </div>
      <hr />
    </AccessibleDialog>
  );
};

export default ValidationResultsModal;
