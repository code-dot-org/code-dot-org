import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Badge} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import style from './bottom-nav.module.scss';

interface NavItem {
  label: string;
  iconName: string;
}

interface BottomNavProps {
  activeLabel: string;
  onNavChange: (label: string) => void;
  unreadNotificationCount?: number;
  showLearn?: boolean;
  showTeacherPanel?: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({
  activeLabel,
  onNavChange,
  unreadNotificationCount = 0,
  showLearn = false,
  showTeacherPanel = false,
}) => {
  const navItems: NavItem[] = [
    // {label: 'Home', iconName: 'house'},
    {label: 'Chats', iconName: 'comment'},
    ...(showLearn ? [{label: 'Prepare', iconName: 'file-lines'}] : []),
    ...(showTeacherPanel
      ? [{label: 'Teacher Panel', iconName: 'chalkboard'}]
      : []),
    {label: 'Alerts', iconName: 'bell'},
  ];

  return (
    <nav className={style.nav} aria-label="Main navigation">
      {navItems.map(({label, iconName}) => {
        const active = label === activeLabel;
        const showDot = label === 'Alerts' && unreadNotificationCount > 0;
        return (
          <button
            key={label}
            type="button"
            className={classNames(style.item, active && style.active)}
            onClick={() => onNavChange(label)}
          >
            <Badge
              variant="dot"
              invisible={!showDot}
              color="error"
              overlap="circular"
              sx={{'& .MuiBadge-badge': {top: -1, right: -1}}}
            >
              <FontAwesomeV6Icon
                iconName={iconName}
                iconStyle={active ? 'solid' : 'regular'}
                className={style.icon}
              />
            </Badge>
            <span className={style.label}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
