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
};

const AutocompleteSelector = onClickOutside(React.createClass({
  getInitialState() {
    return {
      selectedOption: this.props.options.length - 1
    };
  },

  handleClickOutside() {
    this.props.onClickOutside();
  },

  render() {
    // If we ever want to highlight range of matches:
    // http://stackoverflow.com/a/2295681

    return (
      <div
        id="autocomplete-panel"
        style={styles.autocompletePanel}
      >
        {this.props.options.map((option, index) => {
          const isSelected = index === this.props.currentIndex;
          const selectedStyle = {
            backgroundColor: '#cad6fa',
            color: 'black'
            };
          return (
          <div
            key={option}
            onClick={(e) => this.props.onOptionClicked(option, e)}
            onMouseOver={() => this.props.onOptionHovered(index)}
            style={Object.assign({}, styles.autocompleteOption, isSelected ? selectedStyle : {})}
          >
            {option}
          </div>
            );
          })}
      </div>
    );
  },

  propTypes: {
    currentText: React.PropTypes.string,
    currentIndex: React.PropTypes.number,
    options: React.PropTypes.arrayOf(React.PropTypes.string),
    onOptionClicked: React.PropTypes.func,
    onOptionHovered: React.PropTypes.func,
    onClickOutside: React.PropTypes.func
  }
}));

export default AutocompleteSelector;
