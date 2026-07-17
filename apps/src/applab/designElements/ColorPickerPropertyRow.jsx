import TextField from '@code-dot-org/component-library/textField';
import {Box, IconButton as MuiIconButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import ColorPicker from 'react-color';
import ReactDOM from 'react-dom';

import * as rowStyle from './rowStyle';

export default class ColorPickerPropertyRow extends React.Component {
  static propTypes = {
    initialValue: PropTypes.string.isRequired,
    handleChange: PropTypes.func,
    desc: PropTypes.node,
  };

  state = {
    colorPickerText: this.props.initialValue,
    displayColorPicker: false,
  };

  componentDidMount() {
    window.addEventListener('mousedown', this.handlePageClick);
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.handlePageClick);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {initialValue} = nextProps;
    if (this.props.initialValue !== initialValue) {
      this.setState({colorPickerText: initialValue});
    }
  }

  handlePageClick = e => {
    if (e.target === ReactDOM.findDOMNode(this.refs.button)) {
      return;
    }
    var ref = this.refs.colorPicker;
    if (ref && !ReactDOM.findDOMNode(ref).contains(e.target)) {
      this.setState({displayColorPicker: false});
    }
  };

  handleColorChange = color => {
    if (color.rgb.a === 1) {
      // no transparency set
      this.changeElementColor(color.hex);
    } else {
      this.changeElementColor(
        `rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.rgb.a})`
      );
    }
  };

  changeElementColor(color) {
    this.props.handleChange(color);
    this.setState({colorPickerText: color});
  }

  toggleColorPicker = () => {
    this.setState({displayColorPicker: !this.state.displayColorPicker});
  };

  render() {
    const buttonStyle = {
      backgroundColor: this.state.colorPickerText,
      marginTop: '1.375rem',
      height: '2rem',
      width: '2rem',
    };
    let colorPicker = this.state.displayColorPicker ? (
      <Box style={rowStyle.container}>
        <ColorPicker
          ref="colorPicker"
          color={this.state.colorPickerText}
          onChangeComplete={this.handleColorChange}
        />
      </Box>
    ) : null;
    return (
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Box style={rowStyle.container}>
          <TextField
            name={''}
            label={this.props.desc}
            value={this.state.colorPickerText}
            onChange={e => this.setState({colorPickerText: e.target.value})}
            onBlur={e => this.changeElementColor(e.target.value)}
            size="s"
            style={{width: '100%'}}
          />
          <MuiIconButton
            aria-label="Open color picker"
            variant="outlined"
            color="secondary"
            size="extraSmall"
            ref="button"
            type="button"
            className={
              this.state.colorPickerText === '' ? 'rainbow-gradient' : undefined
            }
            style={buttonStyle}
            onClick={this.toggleColorPicker}
          />
        </Box>
        {colorPicker}
      </Box>
    );
  }
}
