// A button the lab draws in the page header's slot (SimpleHeader's
// HEADER_ACTION_ID): the header is a separate React root, so the button
// is portaled across, and its click stays the lab's own. Until the slot
// exists, nothing is drawn.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';

import {HEADER_ACTION_ID} from '@cdo/apps/code-studio/components/header/SimpleHeader';

import styles from './header-action-button.module.scss';

function useHeaderSlot(): HTMLElement | null {
  const [slot, setSlot] = useState(() =>
    document.getElementById(HEADER_ACTION_ID)
  );
  useEffect(() => {
    if (slot) {
      return;
    }
    const observer = new MutationObserver(() => {
      const found = document.getElementById(HEADER_ACTION_ID);
      if (found) {
        observer.disconnect();
        setSlot(found);
      }
    });
    // The header's own root when the page has one: the lab's DOM churn is
    // outside it.
    observer.observe(document.querySelector('.header_level') ?? document.body, {
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, [slot]);
  return slot;
}

interface HeaderActionButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  /** Green, for a button that ends the unit. */
  tone?: 'primary' | 'success';
}

const HeaderActionButton: React.FunctionComponent<HeaderActionButtonProps> = ({
  children,
  onClick,
  tone = 'primary',
}) => {
  const slot = useHeaderSlot();
  if (!slot) {
    return null;
  }
  return createPortal(
    <MuiButton
      variant="contained"
      color="primary"
      size="extraSmall"
      className={classNames(tone === 'success' && styles.success)}
      endIcon={<FontAwesomeV6Icon iconName="arrow-right" iconStyle="solid" />}
      onClick={onClick}
    >
      {children}
    </MuiButton>,
    slot
  );
};

export default HeaderActionButton;
