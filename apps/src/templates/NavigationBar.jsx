import {Link} from '@dsco_/link';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import colorUtil from '@cdo/apps/util/color';

export const NavigationItem = ({
  text,
  href,
  indentLevel = 0,
  isActive = false,
}) => (
  <div
    style={{paddingLeft: `${indentLevel * 12}px`}}
    className={classNames({
      'nav-link': true,
      active: isActive,
    })}
  >
    <Link className="link" href={href} weight="medium">
      {text}
    </Link>
  </div>
);
NavigationItem.propTypes = {
  text: PropTypes.node.isRequired,
  href: PropTypes.string.isRequired,
  indentLevel: PropTypes.number,
  isActive: PropTypes.bool,
};

export const NavigationCategory = ({
  name,
  color = colorUtil.teal,
  initialIsOpen = false,
  useColorWhenClosed = false,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(initialIsOpen || false);
  const backgroundColor =
    useColorWhenClosed || isOpen ? color : colorUtil.lightest_gray;
  const textColor =
    useColorWhenClosed || !isOpen ? colorUtil.dimgray : colorUtil.white;
  return (
    <div
      style={{
        backgroundColor,
        color: textColor,
      }}
      className={classNames({
        category: true,
        open: isOpen,
        'transition-color': isOpen && !useColorWhenClosed,
      })}
    >
      <span
        className="title"
        tabIndex="0"
        role="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={e => {
          if ([' ', 'Enter', 'Spacebar'].includes(e.key)) {
            setIsOpen(!isOpen);
          }
        }}
      >
        {name}
      </span>
      {children}
    </div>
  );
};
NavigationCategory.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.string,
  useColorWhenClosed: PropTypes.bool,
  initialIsOpen: PropTypes.bool,
  children: PropTypes.node,
};

export const NavigationBar = ({children}) => {
  return <div className="nav-bar header">{children}</div>;
};

NavigationBar.propTypes = {
  children: PropTypes.node,
};
