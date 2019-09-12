/** Generic search bar */
import PropTypes from 'prop-types';
import React from 'react';
import color from '@cdo/apps/util/color';

const BORDER_WIDTH = 1;
const BORDER_COLOR = color.light_gray;
const BORDER_RADIUS = 4;

// We have side-by-side elements that should format sort of like one element
const styles = {
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '3px 7px',
    margin: 0,
    borderStyle: 'solid',
    borderWidth: BORDER_WIDTH,
    borderColor: BORDER_COLOR,
    borderRadius: BORDER_RADIUS,
    textIndent: 22
  },
  icon: {
    position: 'absolute',
    top: 5,
    left: 5,
    fontSize: 16,
    color: color.light_gray
  },
  searchArea: {
    position: 'relative',
    margin: '10px 0'
  }
};

export default class SearchBar extends React.Component {
  static propTypes = {
    placeholderText: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
  };

  componentDidMount() {
    this.searchBox.focus();
  }

  render() {
    return (
      <div style={styles.searchArea}>
        <span className="fa fa-search" style={styles.icon} />
        <input
          style={styles.input}
          placeholder={this.props.placeholderText}
          onChange={this.props.onChange}
          ref={input => {
            this.searchBox = input;
          }}
        />
      </div>
    );
  }
}
