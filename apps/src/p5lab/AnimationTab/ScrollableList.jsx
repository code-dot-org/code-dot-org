/** @file Vertical scrolling list */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import style from './scrollable-list.module.scss';

/**
 * Component displaying a vertical list of tiles that scrolls if it grows
 * beyond its natural height.
 */
class ScrollableList extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    children: PropTypes.node,
    onScroll: PropTypes.func
  };

  render() {
    return (
      <div
        className={classNames(this.props.className, style.root)}
        style={{...this.props.style}}
        onScroll={this.props.onScroll}
      >
        <div className={style.margins}>{this.props.children}</div>
      </div>
    );
  }
}

export default ScrollableList;
