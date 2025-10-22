import React, {PropsWithChildren} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';

import moduleStyles from './helpTip.module.scss';

const HelpTip: React.FunctionComponent<PropsWithChildren> = ({children}) => {
  const id = `helptip-${Math.floor(Math.random() * 10000)}`;

  return (
    <span data-for={id} data-tip>
      <WithTooltip
        tooltipProps={{
          tooltipId: `${id}-tooltip`,
          text: children,
          size: 'm',
          direction: 'onTop',
        }}
      >
        <FontAwesomeV6Icon
          iconName="question-circle-o"
          className={moduleStyles.icon}
        />
      </WithTooltip>
    </span>
  );
};

export default HelpTip;
