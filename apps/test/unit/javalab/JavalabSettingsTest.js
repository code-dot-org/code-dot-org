import {assert} from '../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {UnconnectedJavalabSettings} from '@cdo/apps/javalab/JavalabSettings';
import {DisplayTheme} from '@cdo/apps/javalab/DisplayTheme';

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
    assert.strictEqual(wrapper.children().length, 1);
    assert.strictEqual(wrapper.childAt(0).name(), 'JavalabButton');
  });

  it('shows dropdown when clicked', () => {
    const wrapper = createWrapper();
    wrapper.instance().toggleDropdown();
    // 3 buttons: settings theme toggle, increase font, decrease font
    assert.strictEqual(wrapper.find('button').length, 3);
  });

  it('toggles theme and closes dropdown when switch theme button is clicked', () => {
    const wrapper = createWrapper();
    wrapper.instance().toggleDropdown();
    const switchThemeButton = wrapper.find('#javalab-settings-switch-theme');
    assert.equal(switchThemeButton.length, 1);

    switchThemeButton.first().props().onClick();

    sinon.assert.calledWith(setDisplayTheme, DisplayTheme.LIGHT);

    // Assert dropdown is closed
    assert.equal(wrapper.find('#javalab-settings-switch-theme').length, 0);
  });

  it('displays current font size in font size selector', () => {
    const editorFontSize = 20;
    const wrapper = createWrapper({editorFontSize});
    wrapper.instance().toggleDropdown();
    const fontSizeSelector = wrapper.find(
      '#javalab-settings-font-size-selector'
    );
    assert.equal(fontSizeSelector.length, 1);
    assert.isTrue(
      fontSizeSelector.first().text().includes(`${editorFontSize}px`)
    );
  });

  it('increases or decreases font when increase/decrease buttons are clicked', () => {
    const wrapper = createWrapper({
      canIncreaseFontSize: true,
      canDecreaseFontSize: true,
    });
    wrapper.instance().toggleDropdown();

    const decreaseButton = wrapper.find('#javalab-settings-decrease-font');
    assert.equal(decreaseButton.length, 1);
    decreaseButton.first().props().onClick();
    sinon.assert.calledOnce(decreaseEditorFontSize);

    const increaseButton = wrapper.find('#javalab-settings-increase-font');
    assert.equal(increaseButton.length, 1);
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
    assert.isFalse(decreaseButton.first().props().disabled);
    assert.isTrue(increaseButton.first().props().disabled);

    wrapper = createWrapper({
      canIncreaseFontSize: true,
      canDecreaseFontSize: false,
    });
    wrapper.instance().toggleDropdown();
    decreaseButton = wrapper.find('#javalab-settings-decrease-font');
    increaseButton = wrapper.find('#javalab-settings-increase-font');
    assert.isTrue(decreaseButton.first().props().disabled);
    assert.isFalse(increaseButton.first().props().disabled);
  });
});
