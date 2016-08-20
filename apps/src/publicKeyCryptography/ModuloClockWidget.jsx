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
      speed: 1,
      animating: false
    };
  },

  onDividendChange(dividend) {
    this.setState({dividend});
  },

  onModulusChange(modulus) {
    this.setState({modulus});
  },

  onGoClick() {
    this.setState({animating: true});
    this.moduloClock.animateTo(this.state.dividend, this.state.speed, () => {
      this.setState({animating: false});
    });
  },

  onSpeedChange(speed) {
    this.setState({speed});
  },

  render() {
    const {dividend, modulus, speed, animating} = this.state;
    return (
      <div style={style.root}>
        <h1>The Modulo Clock</h1>
        <p>Experiment with this "clock" and different numbers to see what happens.</p>
        <div style={{textAlign: 'center'}}>
          <IntegerTextbox
            value={dividend}
            disabled={animating}
            onChange={this.onDividendChange}
          />
          MOD
          <IntegerTextbox
            value={modulus}
            disabled={animating}
            onChange={this.onModulusChange}
          />
          <button
            disabled={animating}
            onClick={this.onGoClick}
          >
            Go!
          </button>
        </div>
        <ModuloClock
          ref={x => this.moduloClock = x}
          modulus={modulus}
        />
        <div style={{textAlign: 'center'}}>
          <IntegerDropdown
            value={speed}
            options={_.range(1, 10)}
            disabled={animating}
            onChange={this.onSpeedChange}
          />
        </div>
      </div>);
  }
});
export default ModuloClockWidget;
