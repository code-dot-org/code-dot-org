import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import {Box} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import * as rowStyle from './rowStyle';

export default class EnumPropertyRow extends React.Component {
  static propTypes = {
    initialValue: PropTypes.string.isRequired,
    displayOptions: PropTypes.arrayOf(PropTypes.string),
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    handleChange: PropTypes.func.isRequired,
    desc: PropTypes.node,
    containerStyle: PropTypes.object,
  };

  state = {
    selectedValue: this.props.initialValue,
  };

  handleChange = event => {
    this.props.handleChange(event.target.value);
    this.setState({selectedValue: event.target.value});
  };

  render() {
    const {options, displayOptions = [], desc} = this.props;
    const {selectedValue} = this.state;

    return (
      <Box style={this.props.containerStyle || rowStyle.container}>
        <SimpleDropdown
          labelText={desc}
          size="s"
          selectedValue={selectedValue}
          onChange={this.handleChange}
          items={options.map((item, index) => ({
            value: item,
            text: displayOptions[index] || item,
          }))}
          styleAsFormField
          style={{width: '100%'}}
        />
      </Box>
    );
  }
}
