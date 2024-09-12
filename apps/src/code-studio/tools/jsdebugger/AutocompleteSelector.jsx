import PropTypes from 'prop-types';
import React from 'react';
import onClickOutside from 'react-onclickoutside';

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
        <div
          id="autocomplete-panel"
          className="autocomplete-panel"
          style={styles.autocompletePanel}
        >
          {this.props.options.map((option, index) => {
            const isSelected = index === this.props.currentIndex;
            return (
              <div
                key={option}
                className="autocomplete-option"
                onClick={e => {
                  this.props.onOptionClicked(option);
                  e.preventDefault();
                }}
                onMouseOver={() => this.props.onOptionHovered(index)}
                style={{
                  ...styles.autocompleteOption,
                  ...(isSelected ? styles.selectedStyle : {}),
                }}
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

const PANEL_MIN_WIDTH = 163;

const styles = {
  autocompletePanel: {
    width: '100%',
    minWidth: PANEL_MIN_WIDTH,
    height: 'initial',
    background: 'white',
    color: '#808080',
    border: '1px gray solid',
    padding: 0,
    marginTop: -2,
    marginLeft: -1,
  },
  autocompleteOption: {
    cursor: 'pointer',
    margin: 0,
    padding: 4,
  },
  selectedStyle: {
    backgroundColor: '#cad6fa',
    color: 'black',
  },
};
