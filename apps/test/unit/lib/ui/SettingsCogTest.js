import React from 'react';
import {mount} from 'enzyme';
import Portal from 'react-portal';
import msg from '@cdo/locale';
import {expect} from '../../../util/configuredChai';
import SettingsCog, {ManageAssets, ToggleMaker} from '@cdo/apps/lib/ui/SettingsCog';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import * as maker from '@cdo/apps/lib/kits/maker/toolkit';

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

  describe('menu items', () => {
    describe('manage assets', () => {
      it('opens the asset manager and calls handleManageAssets when clicked', () => {
        const handleManageAssets = sinon.spy();
        const wrapper = mount(
          <ManageAssets onClick={handleManageAssets}/>
        );
        expect(wrapper.text()).to.equal(msg.manageAssets());

        expect(handleManageAssets).not.to.have.been.called;
        wrapper.simulate('click');
        expect(handleManageAssets).to.have.been.calledOnce;
      });
    });

    describe('maker toggle', () => {
      beforeEach(() => {
        sinon.stub(maker, 'isAvailable');
        sinon.stub(maker, 'isEnabled');
      });

      afterEach(() => {
        maker.isEnabled.restore();
        maker.isAvailable.restore();
      });

      it('renders with enable maker option if maker is available and disabled', () => {
        maker.isAvailable.returns(true);
        maker.isEnabled.returns(false);
        const wrapper = mount(
          <ToggleMaker/>
        );
        expect(wrapper.text()).to.include(msg.enableMaker());
      });

      it('renders with enable maker option if maker is available and disabled', () => {
        maker.isAvailable.returns(true);
        maker.isEnabled.returns(true);
        const wrapper = mount(
          <ToggleMaker/>
        );
        expect(wrapper.text()).to.include(msg.disableMaker());
      });

      it('hides maker toggle if maker is not available', () => {
        maker.isAvailable.returns(false);
        const wrapper = mount(
          <ToggleMaker/>
        );
        expect(wrapper).to.be.blank;
      });

      it('calls project.toggleMakerEnabled and handleToggleMaker when clicked', () => {
        maker.isAvailable.returns(true);
        maker.isEnabled.returns(false);
        const handleToggleMaker = sinon.spy();
        const wrapper = mount(
          <ToggleMaker onClick={handleToggleMaker}/>
        );
        expect(wrapper.text()).to.equal(msg.enableMaker());

        expect(handleToggleMaker).not.to.have.been.called;
        wrapper.simulate('click');
        expect(handleToggleMaker).to.have.been.calledOnce;
      });
    });
  });
});
