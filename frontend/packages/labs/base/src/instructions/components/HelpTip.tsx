import type {FunctionComponent, PropsWithChildren} from 'react';
import {useId} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';

import moduleStyles from './helpTip.module.scss';

const HelpTip: FunctionComponent<PropsWithChildren> = ({children}) => {
  const id = useId();

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
