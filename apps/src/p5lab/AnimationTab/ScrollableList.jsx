/** @file Vertical scrolling list */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './scrollable-list.module.scss';

/**
 * Component displaying a vertical list of tiles that scrolls if it grows
 * beyond its natural height.
 */
class ScrollableList extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    children: PropTypes.node,
    onScroll: PropTypes.func,
  };

  render() {
    const {children, className, onScroll, style} = this.props;
    return (
      <div
        className={classNames(className, styles.root)}
        style={style}
        onScroll={onScroll}
      >
        <div className={styles.margins}>{children}</div>
      </div>
    );
  }
}

export default ScrollableList;
