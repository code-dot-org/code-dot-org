import Checkbox from '@code-dot-org/component-library/checkbox';
import {Box} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import * as rowStyle from './rowStyle';

export default class BooleanPropertyRow extends React.Component {
  static propTypes = {
    initialValue: PropTypes.bool.isRequired,
    handleChange: PropTypes.func,
    desc: PropTypes.node,
  };

  state = {
    isChecked: this.props.initialValue,
  };

  handleClick = () => {
    const checked = !this.state.isChecked;
    this.props.handleChange(checked);
    this.setState({isChecked: checked});
  };

  render() {
    return (
      <Box style={rowStyle.container}>
        <Checkbox
          checked={this.state.isChecked}
          name={''}
          size="s"
          label={this.props.desc}
          onChange={this.handleClick}
          textThickness="thick"
        />
      </Box>
    );
  }
}
