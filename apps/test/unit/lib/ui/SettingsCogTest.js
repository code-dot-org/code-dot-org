import React from 'react';
import sinon from 'sinon';
import {mount} from 'enzyme';
import Portal from 'react-portal';
import {expect} from '../../../util/configuredChai';
import SettingsCog from '@cdo/apps/lib/ui/SettingsCog';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

describe('SettingsCog', () => {
  it('renders as a FontAwesome icon', () => {
    const wrapper = mount(<SettingsCog/>);
    expect(wrapper.find(FontAwesome)).to.have.length(1);
  });

  it('opens the menu when the cog is clicked', () => {
    const wrapper = mount(<SettingsCog/>);
    const cog = wrapper.find(FontAwesome).first();
    const menu = wrapper.find(Portal).first();
    expect(menu).to.have.prop('isOpened', false);
    cog.simulate('click');
    expect(menu).to.have.prop('isOpened', true);
  });

  it('can close the menu', () => {
    // (It turns out testing the portal auto-close is difficult)
    const wrapper = mount(<SettingsCog/>);
    const cog = wrapper.find(FontAwesome).first();
    const menu = wrapper.find(Portal).first();
    cog.simulate('click');
    expect(menu).to.have.prop('isOpened', true);
    wrapper.instance().close();
    expect(menu).to.have.prop('isOpened', false);
  });

  it('works around buggy portal behavior', done => {
    // This fragile test covers a workaround for an event-handling bug in
    // react-portal that prevents closing the portal by clicking on the icon
    // that opened it.
    // @see https://github.com/tajo/react-portal/issues/140
    // Can probably remove this test if that bug gets fixed and our code
    // gets simplified.
    const wrapper = mount(<SettingsCog/>);
    const cog = wrapper.find(FontAwesome).first();
    const menu = wrapper.find(Portal).first();
    expect(wrapper).to.have.state('canOpen', true);
    expect(cog.prop('onClick')).to.be.a.function;

    // Open the menu
    cog.simulate('click');
    expect(wrapper).to.have.state('canOpen', false);
    expect(cog.prop('onClick')).to.be.undefined;

    // Close the menu
    wrapper.instance().close();
    // This doesn't happen right away - that's our workaround, so we don't
    // re-open the menu in the same moment.
    expect(menu).to.have.prop('isOpened', false);
    expect(cog.prop('onClick')).to.be.undefined;
    setTimeout(() => {
      expect(wrapper).to.have.state('canOpen', true);
      expect(cog.prop('onClick')).to.be.a.function;
      done();
    }, 0);
  });
});
