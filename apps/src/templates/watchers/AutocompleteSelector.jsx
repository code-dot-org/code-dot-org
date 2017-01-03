import onClickOutside from 'react-onclickoutside';
import React from 'react';

const autocompletePanelWidth = 163;

const styles = {
  autocompletePanel: {
    width: autocompletePanelWidth,
    height: 'initial',
    background: 'white',
    color: '#808080',
    border: '1px gray solid',
    padding: 0,
    marginTop: -2,
    marginLeft: -1
  },
  autocompleteOption: {
    cursor: 'pointer',
    margin: 0,
    padding: 4
  },
  selectedStyle: {
    backgroundColor: '#cad6fa',
    color: 'black'
  },
};

const AutocompleteSelector = onClickOutside(React.createClass({
  handleClickOutside() {
    this.props.onClickOutside();
  },

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
            onClick={(e) => {
              this.props.onOptionClicked(option);
              e.preventDefault();
            }}
            onMouseOver={() => this.props.onOptionHovered(index)}
            style={{
              ...styles.autocompleteOption,
              ...isSelected ? styles.selectedStyle : {}
            }}
          >
            {option}
          </div>
          );
        })}
      </div>
    );
  },

  propTypes: {
    currentIndex: React.PropTypes.number.isRequired,
    options: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    onOptionClicked: React.PropTypes.func.isRequired,
    onOptionHovered: React.PropTypes.func.isRequired,
    onClickOutside: React.PropTypes.func.isRequired
  }
}));

export default AutocompleteSelector;
