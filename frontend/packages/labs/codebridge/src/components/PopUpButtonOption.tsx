import {Typography} from '@mui/material';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import styles from './popUpButton.module.css';

// Ported from apps/src/codebridge/PopUpButton/PopUpButtonOption. One row in a
// PopUpButton menu: an icon + label. Used as a child of PopUpButton.

type PopUpButtonOptionProps = {
  iconName: string;
  labelText: string;
  clickHandler?: () => void;
  id?: string;
};

export const PopUpButtonOption = ({
  iconName,
  labelText,
  clickHandler,
  id,
}: PopUpButtonOptionProps) => (
  <div
    onClick={clickHandler}
    onKeyDown={event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        clickHandler?.();
      }
    }}
    className={styles.option}
    role="button"
    tabIndex={0}
    id={id}
  >
    <FontAwesomeV6Icon iconName={iconName} iconStyle="solid" />
    <Typography variant="body4">{labelText}</Typography>
  </div>
);
