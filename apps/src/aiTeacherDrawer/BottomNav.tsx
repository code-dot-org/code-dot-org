import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React from 'react';

import style from './bottom-nav.module.scss';

interface NavItem {
  label: string;
  iconName: string;
}

const NAV_ITEMS: NavItem[] = [
  // {label: 'Home', iconName: 'house'},
  {label: 'Chats', iconName: 'comment'},
  // {label: 'Learn', iconName: 'file-lines'},
  {label: 'Alerts', iconName: 'bell'},
];

interface BottomNavProps {
  activeLabel: string;
  onNavChange: (label: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({activeLabel, onNavChange}) => (
  <nav className={style.nav} aria-label="Main navigation">
    {NAV_ITEMS.map(({label, iconName}) => {
      const active = label === activeLabel;
      return (
        <button
          key={label}
          type="button"
          className={classNames(style.item, active && style.active)}
          onClick={() => onNavChange(label)}
        >
          <FontAwesomeV6Icon
            iconName={iconName}
            iconStyle={active ? 'solid' : 'regular'}
            className={style.icon}
          />
          <span className={style.label}>{label}</span>
        </button>
      );
    })}
  </nav>
);

export default BottomNav;
