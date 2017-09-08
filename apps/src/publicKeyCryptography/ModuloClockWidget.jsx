/** @file Root component for Modulo Clock widget */
import _ from 'lodash';
import React, {PropTypes} from 'react';
import color from "../util/color";
import ModuloClock from './ModuloClock';
import IntegerDropdown from './IntegerDropdown';
import IntegerTextbox from './IntegerTextbox';
import {GoButton} from './cryptographyFields';
import WidgetContinueButton from '../templates/WidgetContinueButton';
import {AnyChildren} from './types';

const style = {
  root: {
    display: 'block',
    maxWidth: 800,
    margin: 'auto',
    fontFamily: `"Gotham 4r", sans-serif`
  },
  h1: {
    fontSize: 38.5
  },
  balancePadding: {
    display: 'inline-block',
    width: 60,
    visibility: 'hidden'
  },
  LabelBelow: {
    root: {
      display: 'inline-block',
      verticalAlign: 'top',
      lineHeight: '30px'
    },
    label: {
      color: color.charcoal,
      textAlign: 'center'
    }
  }
};

/** Root component for Public Key Cryptography widget */
export default class ModuloClockWidget extends React.Component {
  state = {
    dividend: 247,
    modulus: 37,
    speed: 1,
    animating: false
  };

  onDividendChange = dividend => this.setState({dividend});

  onModulusChange = modulus => this.setState({modulus});

  onGoClick = () => {
    this.setState({animating: true});
    const maximumDuration = 8000 / this.state.speed + 2000;
    this.moduloClock.animateTo(this.state.dividend, maximumDuration, null, () => {
      this.setState({animating: false});
    });
  };

  onSpeedChange = speed => this.setState({speed});

  render() {
    const {dividend, modulus, speed, animating} = this.state;
    return (
      <div style={style.root}>
        <h1 style={style.h1}>The Modulo Clock</h1>
        <p>Experiment with this "clock" and different numbers to see what happens.</p>
        <div style={{textAlign: 'center'}}>
          <div style={style.balancePadding}>&nbsp;</div>
          <LabelBelow label="Enter a number">
            <IntegerTextbox
              className="dividend-textbox"
              value={dividend}
              disabled={animating}
              onChange={this.onDividendChange}
            />
          </LabelBelow>
          {' MOD '}
          <LabelBelow label="Pick a clock size">
            <IntegerTextbox
              className="modulus-textbox"
              value={modulus}
              disabled={animating}
              onChange={this.onModulusChange}
            />
          </LabelBelow>
          {' '}
          <GoButton
            className="go-button"
            disabled={animating}
            onClick={this.onGoClick}
          />
        </div>
        <ModuloClock
          ref={x => this.moduloClock = x}
          modulus={modulus}
        />
        <div style={{textAlign: 'center'}}>
          <LabelBelow label="Speed">
            <IntegerDropdown
              className="speed-dropdown"
              value={speed}
              options={_.range(1, 10)}
              disabled={animating}
              onChange={this.onSpeedChange}
            />
          </LabelBelow>
        </div>
        <WidgetContinueButton/>
      </div>);
  }
}

function LabelBelow(props) {
  return (
    <div style={style.LabelBelow.root}>
      {props.children}
      <div style={style.LabelBelow.label}>{props.label}</div>
    </div>);
}
LabelBelow.propTypes = {
  label: PropTypes.string.isRequired,
  children: AnyChildren
};
