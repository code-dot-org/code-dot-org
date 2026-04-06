import classNames from 'classnames';
import type {PropsWithChildren} from 'react';

import Typography from '@code-dot-org/component-library/typography';

import moduleStyles from './panelContainer.module.scss';

const PanelContainerHeader = ({children}: PropsWithChildren) => (
  <Typography
    semanticTag="h2"
    visualAppearance="overline-two"
    className={classNames(
      'panelContainerHeaderItemText',
      moduleStyles.panelContainerHeaderItem,
      moduleStyles.panelContainerHeaderItemCenter,
    )}
  >
    <span className={classNames(moduleStyles.panelContainerHeaderItemText)}>
      {children}
    </span>
  </Typography>
);

export default PanelContainerHeader;
