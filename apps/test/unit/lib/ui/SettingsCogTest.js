import React from 'react';
import Portal from 'react-portal';
import {mount} from 'enzyme';
import sinon from 'sinon';
import msg from '@cdo/locale';
import {expect} from '../../../util/deprecatedChai';
import SettingsCog, {ToggleMaker} from '@cdo/apps/lib/ui/SettingsCog';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import * as makerRedux from '@cdo/apps/lib/kits/maker/redux';
import * as assets from '@cdo/apps/code-studio/assets';

describe('SettingsCog', () => {
  it('renders as a FontAwesome icon', () => {
    const wrapper = mount(<SettingsCog />);
    expect(wrapper.find(FontAwesome)).to.have.length(1);
  });

  it('opens the menu when the cog is clicked', () => {
    const wrapper = mount(<SettingsCog />);
    var portal = wrapper.find(Portal).first();
    expect(portal).to.have.prop('isOpened', false);
    wrapper.instance().open();
    wrapper.update();
    portal = wrapper.find(Portal).first();
    expect(portal).to.have.prop('isOpened', true);
  });

  it('can close the menu', () => {
    // (It turns out testing the portal auto-close is difficult)
    const wrapper = mount(<SettingsCog />);
    wrapper.instance().open();
    wrapper.update();
    var menu = wrapper.find(Portal).first();
    expect(menu).to.have.prop('isOpened', true);
    wrapper.instance().close();
    wrapper.update();
    menu = wrapper.find(Portal).first();
    expect(menu).to.have.prop('isOpened', false);
  });

  it('works around buggy portal behavior', done => {
    // This fragile test covers a workaround for an event-handling bug in
    // react-portal that prevents closing the portal by clicking on the icon
    // that opened it.
    // @see https://github.com/tajo/react-portal/issues/140
    // Can probably remove this test if that bug gets fixed and our code
    // gets simplified.
    const wrapper = mount(<SettingsCog />);
    var cog = wrapper.find(FontAwesome).first();
    var menu = wrapper.find(Portal).first();
    expect(wrapper).to.have.state('canOpen', true);
    expect(cog.prop('onClick')).to.be.a.function;

    // Open the menu
    cog.simulate('click');
    wrapper.update();
    cog = wrapper.find(FontAwesome).first();
    expect(wrapper).to.have.state('canOpen', false);
    expect(cog.prop('onClick')).to.be.undefined;

    // Close the menu
    wrapper.instance().close();
    wrapper.update();
    cog = wrapper.find(FontAwesome).first();
    menu = wrapper.find(Portal).first();
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

  it('does not show maker toggle when "showMakerToggle" is false', () => {
    const wrapper = mount(<SettingsCog showMakerToggle={false} />);
    expect(wrapper.find(ToggleMaker)).to.have.lengthOf(0);
  });

  describe('menu items', () => {
    let wrapper, portal;

    beforeEach(() => {
      wrapper = mount(<SettingsCog showMakerToggle={true} />);
      portal = wrapper.find(Portal).first();
      expect(portal).to.have.prop('isOpened', false);
      wrapper.instance().open();
      wrapper.update();
      portal = wrapper.find(Portal).first();
      expect(portal).to.have.prop('isOpened', true);
    });

    describe('manage assets', () => {
      beforeEach(() => {
        sinon.stub(assets, 'showAssetManager');
      });

      afterEach(() => {
        assets.showAssetManager.restore();
      });

      it('calls showAssetManager when clicked', () => {
        expect(assets.showAssetManager).not.to.have.been.called;
        wrapper.instance().manageAssets();
        wrapper.update();
        expect(assets.showAssetManager).to.have.been.calledOnce;
      });

      it('closes the menu when clicked', () => {
        wrapper.instance().manageAssets();
        wrapper.update();
        portal = wrapper.find(Portal).first();
        expect(portal).to.have.prop('isOpened', false);
      });
    });

    describe('maker toggle', () => {
      beforeEach(() => {
        sinon.stub(makerRedux, 'isAvailable');
        sinon.stub(makerRedux, 'isEnabled');
      });

      afterEach(() => {
        makerRedux.isEnabled.restore();
        makerRedux.isAvailable.restore();
      });

      it('renders with enable maker option if maker is available and disabled', () => {
        makerRedux.isAvailable.returns(true);
        makerRedux.isEnabled.returns(false);
        const wrapper = mount(<ToggleMaker onClick={() => {}} />);
        expect(wrapper.text()).to.include(msg.enableMaker());
      });

      it('renders with disable maker option if maker is available and enabled', () => {
        makerRedux.isAvailable.returns(true);
        makerRedux.isEnabled.returns(true);
        const wrapper = mount(<ToggleMaker onClick={() => {}} />);
        expect(wrapper.text()).to.include(msg.disableMaker());
      });

      it('hides maker toggle if maker is not available', () => {
        makerRedux.isAvailable.returns(false);
        const wrapper = mount(<ToggleMaker onClick={() => {}} />);
        expect(wrapper).to.be.blank;
      });

      it('asks for confirmation when clicked', () => {
        makerRedux.isAvailable.returns(true);
        makerRedux.isEnabled.returns(false);
        var settings = mount(<SettingsCog showMakerToggle={true} />);
        expect(settings.state().confirmingEnableMaker).to.be.false;
        settings.instance().toggleMakerToolkit();
        settings.update();
        expect(settings.state().confirmingEnableMaker).to.be.true;
      });
    });
  });
});
