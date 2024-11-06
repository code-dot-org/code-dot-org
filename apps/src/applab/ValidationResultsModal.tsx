import React from 'react';

import {Heading3} from '@cdo/apps/componentLibrary/typography';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import Spinner from '@cdo/apps/sharedComponents/Spinner';

/**
 * Renders a dialog displaying results of the App Lab Code Checker.
 */

export interface ValidationResultsModalProps {
  onClose: () => void;
  results: string | undefined;
}

const ValidationResultsModal: React.FunctionComponent<
  ValidationResultsModalProps
> = ({onClose, results}) => {
  return (
    <AccessibleDialog onClose={onClose}>
      <div>
        <Heading3>Results</Heading3>
        {!results && <Spinner />}
        {results && <p>{results}</p>}
      </div>
      <hr />
    </AccessibleDialog>
  );
};

export default ValidationResultsModal;
