// A standalone sub-header, used as a PanelContainer child (not the
// container's own headerContent prop) to divide two panels sharing one
// PanelContainer — e.g. maze-lab's Instructions/Play Area split. Present in
// the original @code-dot-org/lab source this package was ported from, but
// dropped from the rename-and-coexist port because music-lab never needed
// it; restored verbatim for maze-lab, which does.
import classNames from 'classnames';
import type {PropsWithChildren, ReactNode} from 'react';

import Typography from '@code-dot-org/component-library/typography';

import moduleStyles from './panelContainer.module.scss';

export interface PanelContainerHeaderProps extends PropsWithChildren {
  className?: string;
  rightHeaderContent?: ReactNode;
  leftHeaderContent?: ReactNode;
}

const PanelContainerHeader = ({
  className,
  leftHeaderContent,
  rightHeaderContent,
  children,
}: PanelContainerHeaderProps) => (
  <div
    className={classNames(
      'panelContainerHeader',
      moduleStyles.panelContainerHeader,
      className,
    )}
  >
    <div
      className={classNames(
        'panelContainerHeaderItemLeft',
        moduleStyles.panelContainerHeaderItem,
        moduleStyles.panelContainerHeaderItemLeft,
      )}
    >
      {leftHeaderContent}
    </div>
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
    <div
      className={classNames(
        'panelContainerHeaderItemRight',
        moduleStyles.panelContainerHeaderItem,
        moduleStyles.panelContainerHeaderItemRight,
      )}
    >
      {rightHeaderContent}
    </div>
  </div>
);

export default PanelContainerHeader;
