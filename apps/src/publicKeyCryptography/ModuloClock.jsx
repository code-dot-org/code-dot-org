/** @file Centered animated Modulo Clock component for the Crypto widget levels */
import React from 'react';
import color from '../color';

const MODULO_CLOCK_RADIUS = 150;
const style = {
  width: 2 * MODULO_CLOCK_RADIUS,
  height: 2 * MODULO_CLOCK_RADIUS,
  margin: 'auto',
  borderRadius: MODULO_CLOCK_RADIUS,
  backgroundColor: color.teal
};

export default function ModuloClock() {
  return (
    <div>
      <div style={style}/>
    </div>);
}
