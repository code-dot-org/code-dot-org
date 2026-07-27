import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import onClickOutside from 'react-onclickoutside';

import styles from './AutocompleteSelector.module.scss';

export default onClickOutside(
  class AutocompleteSelector extends React.Component {
    static propTypes = {
      currentIndex: PropTypes.number.isRequired,
      options: PropTypes.arrayOf(PropTypes.string).isRequired,
      onOptionClicked: PropTypes.func.isRequired,
      onOptionHovered: PropTypes.func.isRequired,
      onClickOutside: PropTypes.func.isRequired,
    };

    // Called by react-onclickoutside wrapper.
    handleClickOutside() {
      this.props.onClickOutside();
    }

    render() {
      // If we ever want to highlight range of matches:
      // http://stackoverflow.com/a/2295681

      return (
        <div id="autocomplete-panel" className={styles.panel}>
          {this.props.options.map((option, index) => {
            const isSelected = index === this.props.currentIndex;
            return (
              <div
                key={option}
                className={classNames(styles.option, {
                  [styles.selected]: isSelected,
                })}
                onClick={e => {
                  this.props.onOptionClicked(option);
                  e.preventDefault();
                }}
                /* 
                  Despite not explicitly handling focus events,
                  this component is already keyboard accessible via the parent component's (Watchers) onKeyDown handler.
                */
                /* eslint-disable-next-line jsx-a11y/mouse-events-have-key-events */
                onMouseOver={() => this.props.onOptionHovered(index)}
              >
                {option}
              </div>
            );
          })}
        </div>
      );
    }
  }
);
