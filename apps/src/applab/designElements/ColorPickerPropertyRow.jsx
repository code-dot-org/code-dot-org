import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import * as rowStyle from './rowStyle';
import ColorPicker from 'react-color';

export default class ColorPickerPropertyRow extends React.Component {
  static propTypes = {
    initialValue: PropTypes.string.isRequired,
    handleChange: PropTypes.func,
    desc: PropTypes.node
  };

  state = {
    colorPickerText: this.props.initialValue,
    displayColorPicker: false
  };

  componentDidMount() {
    window.addEventListener('mousedown', this.handlePageClick);
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.handlePageClick);
  }

  componentWillReceiveProps(nextProps) {
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
      verticalAlign: 'top'
    };
    let colorPicker = this.state.displayColorPicker ? (
      <ColorPicker
        ref="colorPicker"
        color={this.state.colorPickerText}
        onChangeComplete={this.handleColorChange}
      />
    ) : null;
    return (
      <div style={rowStyle.container}>
        <div style={rowStyle.description}>{this.props.desc}</div>
        <div>
          <input
            value={this.state.colorPickerText}
            onChange={e => this.setState({colorPickerText: e.target.value})}
            onBlur={e => this.changeElementColor(e.target.value)}
            style={rowStyle.input}
          />
          <button
            ref="button"
            type="button"
            className={
              this.state.colorPickerText === '' ? 'rainbow-gradient' : undefined
            }
            style={buttonStyle}
            onClick={this.toggleColorPicker}
          />
          {colorPicker}
        </div>
      </div>
    );
  }
}
