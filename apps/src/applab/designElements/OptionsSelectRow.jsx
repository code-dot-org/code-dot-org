import FormFieldWrapper from '@code-dot-org/component-library/formFieldWrapper';
import {Box} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import * as rowStyle from './rowStyle';

export default class OptionsSelectRow extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLSelectElement).isRequired,
    handleChange: PropTypes.func,
    desc: PropTypes.node,
  };

  constructor(props) {
    super(props);

    // Pull the text out of each of our child option elements
    const element = props.element;
    let value = '';
    for (let i = 0; i < element.children.length; i++) {
      value += element.children[i].textContent + '\n';
    }
    this.state = {value};
  }

  handleChangeInternal = event => {
    const value = event.target.value;
    // Extract an array of text values, 1 per line
    const optionList = value.split('\n').filter(function (val) {
      return val !== '';
    });
    this.props.handleChange(optionList);
    this.setState({value});
  };

  render() {
    return (
      <Box style={rowStyle.container}>
        <FormFieldWrapper color="black" size="s" label={this.props.desc}>
          <textarea
            className="form-control"
            name={''}
            value={this.state.value}
            onChange={this.handleChangeInternal}
            style={{
              boxSizing: 'border-box',
              margin: 0,
              width: '100%',
            }}
          />
        </FormFieldWrapper>
      </Box>
    );
  }
}
