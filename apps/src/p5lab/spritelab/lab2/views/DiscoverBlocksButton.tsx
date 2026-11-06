import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import moduleStyles from './block-catalog.module.scss';

interface DiscoverBlocksButtonProps {
  /** How many catalog blocks are still out of the toolbox. */
  remaining: number;
  /** The catalog's icon and the count alone, for a narrow column. */
  compact?: boolean;
  className?: string;
  onClick: () => void;
}

/** The button that opens the new-block catalog, with its count of new blocks. */
const DiscoverBlocksButton: React.FunctionComponent<
  DiscoverBlocksButtonProps
> = ({remaining, compact, className, onClick}) => (
  <MuiButton
    variant="contained"
    color="primary"
    size="small"
    className={classNames(
      moduleStyles.catalogButton,
      compact && moduleStyles.compactButton,
      className
    )}
    aria-label={
      remaining > 0 ? `Discover blocks (${remaining} new)` : 'Discover blocks'
    }
    onClick={onClick}
  >
    {compact ? <FontAwesomeV6Icon iconName="compass" /> : 'Discover blocks'}
    {remaining > 0 && (
      <span className={moduleStyles.count} aria-hidden>
        {remaining}
      </span>
    )}
  </MuiButton>
);

export default DiscoverBlocksButton;
