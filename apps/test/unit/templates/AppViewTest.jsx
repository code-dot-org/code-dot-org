import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/configuredChai';
import {UnconnectedAppView as AppView} from '@cdo/apps/templates/AppView';

describe('AppView', () => {
  const DEFAULT_PROPS = {
    hideSource: false,
    isResponsive: false,
    pinWorkspaceToBottom: false,
    visualizationColumn: null,
    onMount: () => {},
  };

  it('sets no classes on the visualization column in default configuration', () => {
    const wrapper = shallow(
      <AppView
        {...DEFAULT_PROPS}
        hideSource={false}
        isResponsive={false}
        pinWorkspaceToBottom={false}
      />
    );
    expect(wrapper).not.to.be.null;
    expect(wrapper.find("#visualizationColumn")).not.to.have.className('responsive');
    expect(wrapper.find("#visualizationColumn")).not.to.have.className('pin_bottom');
  });

  it('sets `responsive` class on visualization column when `isResponsive` is set', () => {
    const wrapper = shallow(
      <AppView
        {...DEFAULT_PROPS}
        hideSource={false}
        isResponsive={true}
        pinWorkspaceToBottom={false}
      />
    );
    expect(wrapper).not.to.be.null;
    expect(wrapper.find("#visualizationColumn")).to.have.className('responsive');
    expect(wrapper.find("#visualizationColumn")).not.to.have.className('pin_bottom');
  });

  it('sets `pin_bottom` class on visualization column when `pinWorkspaceToBottom` is set', () => {
    const wrapper = shallow(
      <AppView
        {...DEFAULT_PROPS}
        hideSource={false}
        isResponsive={false}
        pinWorkspaceToBottom={true}
      />
    );
    expect(wrapper).not.to.be.null;
    expect(wrapper.find("#visualizationColumn")).not.to.have.className('responsive');
    expect(wrapper.find("#visualizationColumn")).to.have.className('pin_bottom');
  });
});
