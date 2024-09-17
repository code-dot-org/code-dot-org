/** List item placeholder for adding a new item */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import style from './new-list-item.module.scss';

/**
 * List item control (usable in animation or frame lists) for adding
 * a new item - displays as a plus sign in a dashed box.
 */
class NewListItem extends React.Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  };

  render() {
    return (
      <button
        id="newListItem"
        className={style.tile}
        onClick={this.props.onClick}
        type="button"
      >
        <div className={style.wrapper}>
          <div className={style.border}>
            <i className={classNames(style.addButton, 'fa fa-plus-circle')} />
            <div className={style.animationName}>{this.props.label}</div>
          </div>
        </div>
      </button>
    );
  }
}

export default NewListItem;
