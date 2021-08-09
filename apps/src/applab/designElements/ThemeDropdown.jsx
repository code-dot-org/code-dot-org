// Dropdown for theme selection that shows sample icons of what
// each theme will look like
import PropTypes from 'prop-types';
import React from 'react';
import {themeOptionsForSelect, DEFAULT_THEME_INDEX} from '../constants';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import FontAwesome from '../../templates/FontAwesome';

export default class ThemeDropdown extends React.Component {
  static propTypes = {
    initialValue: PropTypes.string.isRequired,
    handleChange: PropTypes.func.isRequired,
    description: PropTypes.node
  };

  state = {
    selectedValue: this.props.initialValue
  };

  handleChange = event => {
    const newValue = event
      ? event.value
      : themeOptionsForSelect[DEFAULT_THEME_INDEX].option;

    this.props.handleChange(newValue);
    this.setState({selectedValue: newValue});
  };

  render() {
    const {description} = this.props;
    const {selectedValue} = this.state;

    const renderedOptions = themeOptionsForSelect.map(function(themeOption) {
      return {
        value: themeOption.option,
        label: (
          <div className="theme-dropdown-label" style={styles.dropdownLabel}>
            <img style={styles.icon} src={themeOption.icon} />
            <div style={styles.label}>{themeOption.displayName}</div>
            <div className="checkbox">
              {selectedValue === themeOption.option && (
                <FontAwesome icon="check" />
              )}
            </div>
          </div>
        )
      };
    });
    return (
      <div style={styles.outerContainer} className="theme-dropdown">
        <div style={styles.description}>{description}</div>
        <Select
          className="form-control"
          value={selectedValue}
          onChange={this.handleChange}
          options={renderedOptions}
          placeholder={''}
          clearable={false}
        />
      </div>
    );
  }
}

const styles = {
  outerContainer: {
    marginBottom: 8,
    width: 240
  },
  description: {
    paddingLeft: 2,
    paddingBottom: 2
  },
  label: {
    paddingLeft: 4
  },
  icon: {
    marginTop: 4,
    marginBottom: 4
  },
  dropdownLabel: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: '10px',
    cursor: 'pointer'
  }
};
