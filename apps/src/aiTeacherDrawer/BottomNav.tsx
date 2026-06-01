import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React from 'react';

import style from './bottom-nav.module.scss';

interface NavItem {
  label: string;
  iconName: string;
  iconStyle: 'solid' | 'regular';
}

const NAV_ITEMS: NavItem[] = [
  {label: 'Home', iconName: 'house', iconStyle: 'solid'},
  {label: 'Chats', iconName: 'comment', iconStyle: 'regular'},
  {label: 'Learn', iconName: 'file-lines', iconStyle: 'regular'},
  {label: 'Alerts', iconName: 'bell', iconStyle: 'regular'},
];

interface BottomNavProps {
  activeLabel: string;
  onNavChange: (label: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({activeLabel, onNavChange}) => (
  <nav className={style.nav} aria-label="Main navigation">
    {NAV_ITEMS.map(({label, iconName, iconStyle}) => (
      <button
        key={label}
        type="button"
        className={classNames(style.item, label === activeLabel && style.active)}
        onClick={() => onNavChange(label)}
      >
        <FontAwesomeV6Icon
          iconName={iconName}
          iconStyle={iconStyle}
          className={style.icon}
        />
        <span className={style.label}>{label}</span>
      </button>
    ))}
  </nav>
);

export default BottomNav;
