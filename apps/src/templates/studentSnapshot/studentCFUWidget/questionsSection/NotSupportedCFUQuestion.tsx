import Link from '@code-dot-org/component-library/link';
import {Typography} from '@mui/material';
import React from 'react';

import {CFULevel} from './../types';

interface NotSupportedCFUQuestionProps {
  level: CFULevel;
}
const NotSupportedCFUQuestion: React.FC<NotSupportedCFUQuestionProps> = ({
  level,
}) => (
  <div>
    <Typography variant="body4">
      This CFU type ({level.type}) is not yet supported in the widget.
      {level.level_url ? (
        <>
          {' '}
          You can view this level{' '}
          <Link size="s" href={level.level_url} openInNewTab>
            here
          </Link>
          .
        </>
      ) : (
        ' Please check back later.'
      )}
    </Typography>
  </div>
);

export default NotSupportedCFUQuestion;
