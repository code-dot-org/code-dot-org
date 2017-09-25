import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import * as rowStyle from './rowStyle';
import ColorPicker from 'react-color';

export default class ColorPickerPropertyRow extends React.Component {
  static propTypes = {
    initialValue: PropTypes.string.isRequired,
    handleChange: PropTypes.func,
    desc: PropTypes.node,
  };

  state = {
    value: this.props.initialValue,
    displayColorPicker: false
  };

  componentDidMount() {
    window.addEventListener('mousedown', this.handlePageClick);
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.handlePageClick);
  }

  handlePageClick = (e) => {
    if (e.target === ReactDOM.findDOMNode(this.refs.button)) {
      return;
    }
    var ref = this.refs.colorPicker;
    if (ref && !ReactDOM.findDOMNode(ref).contains(e.target)) {
      this.setState({displayColorPicker: false});
    }
  };

  handleChangeInternal = (event) => {
    this.changeColor(event.target.value);
  };

  handleColorChange = (color) => {
    if (color.rgb.a === 1) {
      // no transparency set
      this.changeColor(color.hex);
    } else {
      this.changeColor(`rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.rgb.a})`);
    }
  };

  changeColor(color) {
    this.props.handleChange(color);
    this.setState({value: color});
  }

  toggleColorPicker = () => {
    this.setState({displayColorPicker: !this.state.displayColorPicker});
  };

  render() {
    const buttonStyle = {
      backgroundColor: this.state.value,
      verticalAlign: 'top'
    };
    let colorPicker = this.state.displayColorPicker ? (
      <ColorPicker
        ref="colorPicker"
        color={this.state.value}
        onChangeComplete={this.handleColorChange}
      />
    ) : null;
    return (
      <div style={rowStyle.container}>
        <div style={rowStyle.description}>{this.props.desc}</div>
        <div>
          <input
            value={this.state.value}
            onChange={this.handleChangeInternal}
            style={rowStyle.input}
          />
          <button
            ref="button"
            className={this.state.value === '' ? 'rainbow-gradient' : undefined}
            style={buttonStyle}
            onClick={this.toggleColorPicker}
          >
          </button>
          {colorPicker}
        </div>
      </div>
    );
  }
}
