import {Tooltip} from '@mui/material';
import type {FunctionComponent, PropsWithChildren} from 'react';
import {useId} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import moduleStyles from './helpTip.module.scss';

const HelpTip: FunctionComponent<PropsWithChildren> = ({children}) => {
  const id = useId();

  return (
    <Tooltip id={`${id}-tooltip`} title={children} placement="top">
      {/* The icon takes no ref; the span is what the tooltip anchors to and
          what a keyboard user focuses. */}
      <span role="img" aria-label="Help" tabIndex={0}>
        <FontAwesomeV6Icon
          iconName="question-circle-o"
          className={moduleStyles.icon}
        />
      </span>
    </Tooltip>
  );
};

export default HelpTip;
