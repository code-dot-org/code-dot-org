/** Generic search bar */
import PropTypes from 'prop-types';
import React from 'react';

export default class SearchBar extends React.Component {
  static propTypes = {
    placeholderText: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    clearButton: PropTypes.bool,
  };

  componentDidMount() {
    this.searchBox.focus();
  }

  render() {
    return (
      <div style={styles.searchArea}>
        <span className="fa-solid fa-magnifying-glass" style={styles.icon} />
        <input
          style={styles.input}
          placeholder={this.props.placeholderText}
          onChange={this.props.onChange}
          ref={input => {
            this.searchBox = input;
          }}
        />
        {this.props.clearButton && (
          <span
            className="fa-solid fa-xmark"
            style={styles.clearIcon}
            onClick={() => {
              this.searchBox.value = '';
              this.props.onChange();
            }}
          />
        )}
      </div>
    );
  }
}

const BORDER_WIDTH = 1;
const BORDER_COLOR = 'var(--borders-neutral-primary)';
const BORDER_RADIUS = 4;
const ICON_COLOR = 'var(--text-neutral-secondary)';

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
    textIndent: 22,
    color: 'var(--text-neutral-primary)',
    backgroundColor: 'var(--background-neutral-primary)',
  },
  icon: {
    position: 'absolute',
    top: 6,
    left: 5,
    fontSize: 16,
    color: ICON_COLOR,
  },
  clearIcon: {
    position: 'absolute',
    top: 6,
    right: 5,
    fontSize: 16,
    color: ICON_COLOR,
    cursor: 'pointer',
  },
  searchArea: {
    position: 'relative',
    margin: '10px 0',
  },
};
