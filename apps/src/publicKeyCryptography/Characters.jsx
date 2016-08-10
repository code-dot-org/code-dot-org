/** @file Character calculations, displayed side-by-side */
import React from 'react';
import CollapsiblePanel from './CollapsiblePanel';

const style = {
  alice: {
    backgroundColor: 'red',
    height: 200,
  },
  eve: {
    backgroundColor: 'green',
    height: 200,
  },
  bob: {
    backgroundColor: 'blue',
    height: 200,
  }
};

export function Alice() {
  return (
    <CollapsiblePanel title="Alice">
      <div style={style.alice}/>
    </CollapsiblePanel>);
}

export function Eve() {
  return (
    <CollapsiblePanel title="Eve">
      <div style={style.eve}/>
    </CollapsiblePanel>);
}

export function Bob() {
  return (
    <CollapsiblePanel title="Bob">
      <div style={style.bob}/>
    </CollapsiblePanel>);
}
