import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';

import DebugButtons from '@cdo/apps/lib/tools/jsdebugger/DebugButtons';
import {reducers, actions} from '@cdo/apps/lib/tools/jsdebugger/redux';
import JSInterpreter from '@cdo/apps/lib/tools/jsinterpreter/JSInterpreter';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';

const EXAMPLE_CODE = `
for (var i = 0; i < 10; i++) {
  i;
}`;

describe('The DebugConsole component', () => {
  let root, interpreter;

  function runApp() {
    interpreter = new JSInterpreter({
      // set shouldRunAtMaxSpeed to false so interpreter
      // doesn't ignore breakpoints.
      shouldRunAtMaxSpeed: () => false,
      studioApp: {
        // set hideSource to true so interpreter doesn't try to look up
        // non-existent ace editor
        hideSource: true,
      },
    });
    jest.spyOn(interpreter, 'handleStepOver').mockClear();
    jest.spyOn(interpreter, 'handlePauseContinue').mockClear();
    jest.spyOn(interpreter, 'handleStepIn').mockClear();
    jest.spyOn(interpreter, 'handleStepOut').mockClear();
    getStore().dispatch(actions.attach(interpreter));
    interpreter.parse({code: EXAMPLE_CODE});
    interpreter.executeInterpreter(true);
  }

  beforeEach(() => {
    stubRedux();
    registerReducers(reducers);
    getStore().dispatch(actions.initialize({runApp}));
    root = mount(
      <Provider store={getStore()}>
        <DebugButtons />
      </Provider>
    );
  });

  afterEach(() => {
    restoreRedux();
  });

  const buttons = {
    pauseButton: () => root.find('#pauseButton'),
    continueButton: () => root.find('#continueButton'),
    stepOverButton: () => root.find('#stepOverButton'),
    stepOutButton: () => root.find('#stepOutButton'),
    stepInButton: () => root.find('#stepInButton'),
  };

  function isVisible(selector) {
    const wrapper = selector();
    return (
      wrapper.exists() &&
      (!wrapper.props().style || wrapper.props().style.display !== 'none')
    );
  }

  function isEnabled(selector) {
    return isVisible(selector) && !selector().props().disabled;
  }

  function getVisibleButtons() {
    return Object.keys(buttons).filter(key => isVisible(buttons[key]));
  }

  function getEnabledButtons() {
    return Object.keys(buttons).filter(key => isEnabled(buttons[key]));
  }

  describe('before anything has happend', () => {
    it('the pause, step over, step out, and step in buttons are visible', () => {
      expect(getVisibleButtons()).toEqual([
        'pauseButton',
        'stepOverButton',
        'stepOutButton',
        'stepInButton',
      ]);
    });

    it('only the step in button is enabled', () => {
      expect(getEnabledButtons()).toEqual(['stepInButton']);
    });
  });

  describe('After clicking the step in button', () => {
    beforeEach(() => {
      React.act(() => {
        buttons.stepInButton().simulate('click');
        // kick the interpreter so that it updates it's state.
        // this normally gets triggered by whatever code is
        // responsible for dealing with the interpreter (applab/gamelab)
        // TODO: consider a different architecture?
        interpreter.executeInterpreter(false);
      });
      root.update();
    });

    it('the handlePauseContinue method of the interpreter gets called', () => {
      expect(interpreter.handlePauseContinue).toHaveBeenCalled();
    });

    it('the handleStepIn method of the interpreter gets called', () => {
      expect(interpreter.handleStepIn).toHaveBeenCalled();
    });

    it('the continue, step over, step out, and step in buttons are visible and enabled', () => {
      expect(getVisibleButtons()).toEqual([
        'continueButton',
        'stepOverButton',
        'stepOutButton',
        'stepInButton',
      ]);
      expect(getEnabledButtons()).toEqual([
        'continueButton',
        'stepOverButton',
        'stepOutButton',
        'stepInButton',
      ]);
    });

    describe('when the step over button is clicked', () => {
      beforeEach(() => buttons.stepOverButton().simulate('click'));
      it("the interpreter's handleStepOver method is called", () => {
        expect(interpreter.handleStepOver).toHaveBeenCalled();
      });
    });

    describe('when the step out button is clicked', () => {
      beforeEach(() => buttons.stepOutButton().simulate('click'));
      it("the interpreter's handleStepOut method is called", () => {
        expect(interpreter.handleStepOut).toHaveBeenCalled();
      });
    });

    describe('when the step in button is clicked', () => {
      beforeEach(() => buttons.stepInButton().simulate('click'));
      it("the interpreter's handleStepIn method is called", () => {
        expect(interpreter.handleStepIn).toHaveBeenCalled();
      });
    });
  });

  describe('When the interpreter is started from somewhere else', () => {
    beforeEach(() => {
      React.act(() => {
        runApp();
      });
      root.update();
    });

    it('the pause, step over, step in, and step out buttons are visible', () => {
      expect(getVisibleButtons()).toEqual([
        'pauseButton',
        'stepOverButton',
        'stepOutButton',
        'stepInButton',
      ]);
    });

    it('only the pause button is enabled', () => {
      expect(getEnabledButtons()).toEqual(['pauseButton']);
    });

    describe('and the pause button is clicked', () => {
      beforeEach(() => buttons.pauseButton().simulate('click'));

      it("the interpreter's handlePauseContinue method is called", () => {
        expect(interpreter.handlePauseContinue).toHaveBeenCalled();
      });

      it('the continue, step over, step out, and step in buttons are visible and enabled', () => {
        expect(getVisibleButtons()).toEqual([
          'continueButton',
          'stepOverButton',
          'stepOutButton',
          'stepInButton',
        ]);
        expect(getEnabledButtons()).toEqual([
          'continueButton',
          'stepOverButton',
          'stepOutButton',
          'stepInButton',
        ]);
      });
    });
  });
});
