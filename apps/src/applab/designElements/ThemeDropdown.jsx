// Dropdown for theme selection that shows sample icons of what
// each theme will look like
import PropTypes from 'prop-types';
import React from 'react';
import {themeOptionsForSelect} from '../constants';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

export default class ThemeDropdown extends React.Component {
  static propTypes = {
    initialValue: PropTypes.string.isRequired,
    handleChange: PropTypes.func.isRequired,
    desc: PropTypes.node
  };

  state = {
    selectedValue: this.props.initialValue
  };
  handleChange = event => {
    this.props.handleChange(event.value);
    this.setState({selectedValue: event.value});
  };

  // Need to reset theme value if screen switches
  componentWillReceiveProps(nextProps) {
    const {initialValue} = nextProps;
    if (this.props.initialValue !== initialValue) {
      this.setState({selectedValue: initialValue});
    }
  }

  // need map of value-> {icon, display name}
  render() {
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
        flexDeirection: 'row',
        alignItems: 'center'
      }
    };

    const {desc} = this.props;
    const {selectedValue} = this.state;

    const renderedOptions = themeOptionsForSelect.map(function(option, index) {
      return {
        value: option.option,
        label: (
          <div className="theme-dropdown-label" style={styles.dropdownLabel}>
            <img style={styles.icon} src={option.icon} />
            <div style={styles.label}>{option.displayName}</div>
          </div>
        )
      };
    });
    return (
      <div style={styles.outerContainer} className="theme-dropdown">
        <div style={styles.description}>{desc}</div>
        <Select
          className="form-control"
          value={selectedValue}
          onChange={this.handleChange}
          options={renderedOptions}
          placeholder={''}
        />
      </div>
    );
  }
}
