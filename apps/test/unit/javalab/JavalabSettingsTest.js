import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; //eslint-disable-line no-restricted-imports

import {DisplayTheme} from '@cdo/apps/javalab/DisplayTheme';
import {UnconnectedJavalabSettings} from '@cdo/apps/javalab/JavalabSettings';

describe('JavalabSettings', () => {
  let setDisplayTheme,
    increaseEditorFontSize,
    decreaseEditorFontSize,
    defaultProps;

  beforeEach(() => {
    setDisplayTheme = sinon.stub();
    increaseEditorFontSize = sinon.stub();
    decreaseEditorFontSize = sinon.stub();

    defaultProps = {
      displayTheme: DisplayTheme.DARK,
      setDisplayTheme,
      increaseEditorFontSize,
      decreaseEditorFontSize,
      canIncreaseFontSize: true,
      canDecreaseFontSize: false,
      editorFontSize: 13,
    };
  });

  function createWrapper(overrideProps) {
    return shallow(
      <UnconnectedJavalabSettings {...defaultProps} {...overrideProps} />
    );
  }

  it('is initially just a button', () => {
    const wrapper = createWrapper();
    expect(wrapper.children().length).toBe(1);
    expect(wrapper.childAt(0).name()).toBe('JavalabButton');
  });

  it('shows dropdown when clicked', () => {
    const wrapper = createWrapper();
    wrapper.instance().toggleDropdown();
    // 3 buttons: settings theme toggle, increase font, decrease font
    expect(wrapper.find('button').length).toBe(3);
  });

  it('toggles theme and closes dropdown when switch theme button is clicked', () => {
    const wrapper = createWrapper();
    wrapper.instance().toggleDropdown();
    const switchThemeButton = wrapper.find('#javalab-settings-switch-theme');
    expect(switchThemeButton.length).toEqual(1);

    switchThemeButton.first().props().onClick();

    sinon.assert.calledWith(setDisplayTheme, DisplayTheme.LIGHT);

    // Assert dropdown is closed
    expect(wrapper.find('#javalab-settings-switch-theme').length).toEqual(0);
  });

  it('displays current font size in font size selector', () => {
    const editorFontSize = 20;
    const wrapper = createWrapper({editorFontSize});
    wrapper.instance().toggleDropdown();
    const fontSizeSelector = wrapper.find(
      '#javalab-settings-font-size-selector'
    );
    expect(fontSizeSelector.length).toEqual(1);
    expect(
      fontSizeSelector.first().text().includes(`${editorFontSize}px`)
    ).toBe(true);
  });

  it('increases or decreases font when increase/decrease buttons are clicked', () => {
    const wrapper = createWrapper({
      canIncreaseFontSize: true,
      canDecreaseFontSize: true,
    });
    wrapper.instance().toggleDropdown();

    const decreaseButton = wrapper.find('#javalab-settings-decrease-font');
    expect(decreaseButton.length).toEqual(1);
    decreaseButton.first().props().onClick();
    sinon.assert.calledOnce(decreaseEditorFontSize);

    const increaseButton = wrapper.find('#javalab-settings-increase-font');
    expect(increaseButton.length).toEqual(1);
    increaseButton.first().props().onClick();
    sinon.assert.calledOnce(increaseEditorFontSize);
  });

  it('disables increase/decrease font buttons based on props', () => {
    let wrapper = createWrapper({
      canIncreaseFontSize: false,
      canDecreaseFontSize: true,
    });
    wrapper.instance().toggleDropdown();
    let decreaseButton = wrapper.find('#javalab-settings-decrease-font');
    let increaseButton = wrapper.find('#javalab-settings-increase-font');
    expect(decreaseButton.first().props().disabled).toBe(false);
    expect(increaseButton.first().props().disabled).toBe(true);

    wrapper = createWrapper({
      canIncreaseFontSize: true,
      canDecreaseFontSize: false,
    });
    wrapper.instance().toggleDropdown();
    decreaseButton = wrapper.find('#javalab-settings-decrease-font');
    increaseButton = wrapper.find('#javalab-settings-increase-font');
    expect(decreaseButton.first().props().disabled).toBe(true);
    expect(increaseButton.first().props().disabled).toBe(false);
  });
});
