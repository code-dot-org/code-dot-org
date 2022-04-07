import React, {useState} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import colorUtil from '@cdo/apps/util/color';
import {Link} from '@dsco_/link';

export const NavigationItem = ({
  text,
  href,
  indentLevel = 0,
  isActive = false
}) => (
  <div
    style={{paddingLeft: `${indentLevel * 12}px`}}
    className={classNames({
      'nav-link': true,
      active: isActive
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
  isActive: PropTypes.bool
};

export const NavigationCategory = ({
  name,
  color = colorUtil.teal,
  initialIsOpen = false,
  children
}) => {
  const [isOpen, setIsOpen] = useState(initialIsOpen || false);
  return (
    <div
      style={{
        backgroundColor: isOpen ? color : colorUtil.lightest_gray
      }}
      className={classNames({category: true, open: isOpen})}
    >
      <span className="title" onClick={() => setIsOpen(!isOpen)}>
        {name}
      </span>
      {children}
    </div>
  );
};
NavigationCategory.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.string,
  initialIsOpen: PropTypes.bool,
  children: PropTypes.node
};

export const NavigationBar = ({children}) => {
  return <div className="nav-bar header">{children}</div>;
};

NavigationBar.propTypes = {
  children: PropTypes.node
};
