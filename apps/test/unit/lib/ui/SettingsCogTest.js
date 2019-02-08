import React from 'react';
import Portal from 'react-portal';
import {mount} from 'enzyme';
import sinon from 'sinon';
import msg from '@cdo/locale';
import {expect} from '../../../util/configuredChai';
import SettingsCog, {ToggleMaker} from '@cdo/apps/lib/ui/SettingsCog';
import PopUpMenu from '@cdo/apps/lib/ui/PopUpMenu';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import * as makerRedux from '@cdo/apps/lib/kits/maker/redux';
import * as assets from '@cdo/apps/code-studio/assets';
import {getPortalContent} from '../../../util/reactTestUtils';

describe('SettingsCog', () => {
  it('renders as a FontAwesome icon', () => {
    const wrapper = mount(<SettingsCog />);
    expect(wrapper.find(FontAwesome)).to.have.length(1);
  });

  it('opens the menu when the cog is clicked', () => {
    const wrapper = mount(<SettingsCog />);
    const cog = wrapper.find(FontAwesome).first();
    const portal = wrapper.find(Portal).first();
    expect(portal).to.have.prop('isOpened', false);
    cog.simulate('click');
    expect(portal).to.have.prop('isOpened', true);
  });

  it('can close the menu', () => {
    // (It turns out testing the portal auto-close is difficult)
    const wrapper = mount(<SettingsCog />);
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
    const wrapper = mount(<SettingsCog />);
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

  it('only shows manage assets when maker toggle is false', () => {
    const wrapper = mount(<SettingsCog showMakerToggle={false} />);
    const cog = wrapper.find(FontAwesome).first();
    cog.simulate('click');
    const menuWrapper = getPortalContent(wrapper);
    const numMenuItems = menuWrapper.find(PopUpMenu.Item).length;
    expect(numMenuItems).to.equal(1);
  });

  describe('menu items', () => {
    let wrapper, portal, menuWrapper;

    beforeEach(() => {
      wrapper = mount(<SettingsCog showMakerToggle={true} />);
      const cog = wrapper.find(FontAwesome).first();
      portal = wrapper.find(Portal).first();
      expect(portal).to.have.prop('isOpened', false);
      cog.simulate('click');
      expect(portal).to.have.prop('isOpened', true);
      menuWrapper = getPortalContent(wrapper);
    });

    describe('manage assets', () => {
      beforeEach(() => {
        sinon.stub(assets, 'showAssetManager');
      });

      afterEach(() => {
        assets.showAssetManager.restore();
      });

      it('is the first menu item', () => {
        const firstMenuItem = menuWrapper.find(PopUpMenu.Item).first();
        expect(firstMenuItem.text()).to.equal(msg.manageAssets());
      });

      it('calls showAssetManager when clicked', () => {
        const firstMenuItem = menuWrapper
          .find(PopUpMenu.Item)
          .first()
          .children()
          .first();
        expect(assets.showAssetManager).not.to.have.been.called;
        firstMenuItem.simulate('click');
        expect(assets.showAssetManager).to.have.been.calledOnce;
      });

      it('closes the menu when clicked', () => {
        const firstMenuItem = menuWrapper
          .find(PopUpMenu.Item)
          .first()
          .children()
          .first();
        firstMenuItem.simulate('click');
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

      it('calls handleToggleMaker when clicked', () => {
        makerRedux.isAvailable.returns(true);
        makerRedux.isEnabled.returns(false);
        const handleToggleMaker = sinon.spy();
        const wrapper = mount(<ToggleMaker onClick={handleToggleMaker} />);
        expect(wrapper.text()).to.equal(msg.enableMaker());

        expect(handleToggleMaker).not.to.have.been.called;
        wrapper
          .children()
          .first()
          .simulate('click');
        expect(handleToggleMaker).to.have.been.calledOnce;
      });
    });
  });
});
