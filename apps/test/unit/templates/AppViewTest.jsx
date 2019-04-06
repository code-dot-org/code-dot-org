import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/reconfiguredChai';
import {UnconnectedAppView as AppView} from '@cdo/apps/templates/AppView';

describe('AppView', () => {
  const DEFAULT_PROPS = {
    hideSource: false,
    isResponsive: false,
    pinWorkspaceToBottom: false,
    visualizationColumn: null,
    onMount: () => {}
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
    const column = wrapper.find('#visualizationColumn');
    expect(column.hasClass('responsive')).is.false;
    expect(column.hasClass('pin_bottom')).is.false;
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
    const column = wrapper.find('#visualizationColumn');
    expect(column.hasClass('responsive')).is.true;
    expect(column.hasClass('pin_bottom')).is.false;
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
    const column = wrapper.find('#visualizationColumn');
    expect(column.hasClass('responsive')).is.false;
    expect(column.hasClass('pin_bottom')).is.true;
  });
});
