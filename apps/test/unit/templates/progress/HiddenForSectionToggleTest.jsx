import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/deprecatedChai';
import sinon from 'sinon';
import {UnconnectedHiddenForSectionToggle as HiddenForSectionToggle} from '@cdo/apps/templates/progress/HiddenForSectionToggle';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';

describe('HiddenForSectionToggle', () => {
  it('renders two buttons reflecting hidden state', () => {
    const wrapper = shallow(
      <HiddenForSectionToggle hidden={false} onChange={() => {}} />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <Button
          __useDeprecatedTag
          text={i18n.visible()}
          color={Button.ButtonColor.gray}
          disabled={true}
          icon="eye"
        />
        <Button
          __useDeprecatedTag
          text={i18n.hidden()}
          color={Button.ButtonColor.gray}
          disabled={false}
          icon="eye-slash"
        />
      </div>
    );

    // Changing the 'hidden' prop reverses which button is enabled:
    wrapper.setProps({hidden: true});
    expect(wrapper).to.containMatchingElement(
      <div>
        <Button __useDeprecatedTag text={i18n.visible()} disabled={false} />
        <Button __useDeprecatedTag text={i18n.hidden()} disabled={true} />
      </div>
    );
  });

  it('calls onChange handler when buttons are clicked', () => {
    const callback = sinon.spy();
    const wrapper = shallow(
      <HiddenForSectionToggle hidden={false} onChange={callback} />
    );

    // Click the first button
    wrapper
      .find(Button)
      .at(0)
      .props()
      .onClick();
    expect(callback).to.have.been.calledOnce.and.calledWith('visible');

    callback.resetHistory();

    // Click the second button
    wrapper
      .find(Button)
      .at(1)
      .props()
      .onClick();
    expect(callback).to.have.been.calledOnce.and.calledWith('hidden');
  });

  it('does not call onChange when disabled', () => {
    const callback = sinon.spy();
    const wrapper = shallow(
      <HiddenForSectionToggle hidden={false} onChange={callback} disabled />
    );

    // Click both buttons
    wrapper
      .find(Button)
      .at(0)
      .props()
      .onClick();
    wrapper
      .find(Button)
      .at(1)
      .props()
      .onClick();
    expect(callback).not.to.have.been.called;
  });
});
