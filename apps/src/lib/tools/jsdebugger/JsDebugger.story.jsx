import React from 'react';
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';
import commonReducers from '../../../redux/commonReducers';
import {setPageConstants} from '../../../redux/pageConstants';
import JsDebugger, {UnconnectedJsDebugger} from './JsDebugger';

export default storybook => {
  const storyTable = [];

  const storybookStyle = {
    position: 'relative'
  };

  storyTable.push(
    {
      name: 'empty',
      story: () => (
        <UnconnectedJsDebugger style={storybookStyle}/>
      )
    });

  storyTable.push(
    {
      name: 'empty paused',
      story: () => (
        <UnconnectedJsDebugger style={storybookStyle} isDebuggerPaused/>
      )
    });

  storyTable.push(
    {
      name: 'with debug buttons',
      story: () => (
        <UnconnectedJsDebugger style={storybookStyle} debugButtons/>
      )
    });

  storyTable.push(
    {
      name: 'with debug console',
      story: () => (
        <div style={{height: 200}}>
          <UnconnectedJsDebugger style={storybookStyle} debugConsole/>
        </div>
      )
    });

  const emptyStore = createStore(combineReducers(commonReducers));
  storyTable.push(
    {
      name: 'connected to redux stores with nothing enabled',
      story: () => (
        <Provider store={emptyStore}>
          <JsDebugger style={storybookStyle}/>
        </Provider>
      )
    });

  const showAllStore = createStore(combineReducers(commonReducers));
  showAllStore.dispatch(setPageConstants({
    showDebugButtons: true,
    showDebugConsole: true,
    showDebugWatch: true,
    showDebugSlider: true
  }));
  storyTable.push(
    {
      name: 'connected to redux stores with everything enabled',
      story: () => (
        <Provider store={showAllStore}>
          <JsDebugger style={storybookStyle} debugWatch/>
        </Provider>
      )
    });

  storybook
    .storiesOf('JsDebugger', JsDebugger)
    .addStoryTable(storyTable);
};
