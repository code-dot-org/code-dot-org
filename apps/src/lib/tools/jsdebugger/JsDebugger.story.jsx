import React from 'react';
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';
import commonReducers from '../../../redux/commonReducers';
import {reducers as applabReducers} from '../../../applab/redux/applab';
import {setPageConstants} from '../../../redux/pageConstants';
import JsDebugger from './JsDebugger';

function createApplabStore() {
  return createStore(combineReducers({
    ...commonReducers,
    ...applabReducers,
  }));
}

export default storybook => {
  const storyTable = [];

  const storybookStyle = {
    position: 'relative',
    width: '100%',
  };

  storyTable.push({
    name: 'empty',
    story: () => {
      const withDebugConsoleStore = createApplabStore();
      withDebugConsoleStore.dispatch(setPageConstants({
        appType: "gamelab"
      }));
      return (
        <Provider store={withDebugConsoleStore}>
          <JsDebugger
            style={storybookStyle}
          />
        </Provider>
      );
    }
  });

  storyTable.push({
    name: 'with only debug console',
    story: () => {
      const withDebugConsoleStore = createApplabStore();
      withDebugConsoleStore.dispatch(setPageConstants({
        showDebugConsole: true,
        appType: "gamelab"
      }));
      return (
        <div style={{height: 200}}>
          <Provider store={withDebugConsoleStore}>
            <JsDebugger style={storybookStyle}/>
          </Provider>
        </div>
      );
    }
  });

  storyTable.push({
    name: 'with speed slider',
    story: () => {
      const withDebugSliderStore = createApplabStore();
      withDebugSliderStore.dispatch(setPageConstants({
        showDebugConsole: true,
        showDebugSlider: true,
        appType: "gamelab"
      }));
      return (
        <Provider store={withDebugSliderStore}>
          <JsDebugger style={storybookStyle}/>
        </Provider>
      );
    }
  });

  storyTable.push({
    name: 'with debug buttons',
    story: () => {
      const withDebugButtonsStore = createApplabStore();
      withDebugButtonsStore.dispatch(setPageConstants({
        showDebugConsole: true,
        showDebugButtons: true,
        appType: "gamelab"
      }));
      return (
        <Provider store={withDebugButtonsStore}>
          <JsDebugger style={storybookStyle}/>
        </Provider>
      );
    }
  });

  storyTable.push({
    name: 'with debug watch',
    story: () => {
      const withDebugWatchStore = createApplabStore();
      withDebugWatchStore.dispatch(setPageConstants({
        showDebugConsole: true,
        showDebugWatch: true,
        appType: "gamelab"
      }));
      return (
        <Provider store={withDebugWatchStore}>
          <JsDebugger style={storybookStyle}/>
        </Provider>
      );
    }
  });

  storyTable.push({
    name: 'connected to redux stores with everything enabled',
    story: () => {
      const showAllStore = createApplabStore();
      showAllStore.dispatch(setPageConstants({
        showDebugButtons: true,
        showDebugConsole: true,
        showDebugWatch: true,
        showDebugSlider: true,
        appType: "gamelab"
      }));
      return (
        <Provider store={showAllStore}>
          <JsDebugger style={storybookStyle} debugWatch/>
        </Provider>
      );
    }
  });

  storybook
    .storiesOf('JsDebugger', JsDebugger)
    .addStoryTable(storyTable);
};
