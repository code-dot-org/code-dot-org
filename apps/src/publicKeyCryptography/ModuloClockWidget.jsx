/** @file Root component for Modulo Clock widget */
import _ from 'lodash';
import React from 'react';
import ModuloClock from './ModuloClock';
import IntegerDropdown from './IntegerDropdown';
import IntegerTextbox from './IntegerTextbox';

const style = {
  root: {
    fontFamily: `"Gotham 4r", sans-serif`
  }
};

/** Root component for Public Key Cryptography widget */
const ModuloClockWidget = React.createClass({
  getInitialState() {
    return {
      dividend: 247,
      modulus: 37,
      speed: 1
    };
  },

  onDividendChange(dividend) {
    this.setState({dividend});
  },

  onModulusChange(modulus) {
    this.setState({modulus});
  },

  onSpeedChange(speed) {
    this.setState({speed});
  },

  render() {
    const {dividend, modulus, speed} = this.state;
    return (
      <div style={style.root}>
        <h1>The Modulo Clock</h1>
        <p>Experiment with this "clock" and different numbers to see what happens.</p>
        <div style={{textAlign: 'center'}}>
          <IntegerTextbox
            value={dividend}
            onChange={this.onDividendChange}
          />
          MOD
          <IntegerTextbox
            value={modulus}
            onChange={this.onModulusChange}
          />
          <button>Go!</button>
        </div>
        <ModuloClock modulus={modulus}/>
        <div style={{textAlign: 'center'}}>
          <IntegerDropdown
            value={speed}
            onChange={this.onSpeedChange}
            options={_.range(1, 10)}
          />
        </div>
      </div>);
  }
});
export default ModuloClockWidget;
