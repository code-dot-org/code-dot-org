/** @file Tests for SettingsMenu */
import React from 'react';
import sinon from 'sinon';
import {mount} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import msg from '@cdo/locale';
import SettingsMenu from '@cdo/apps/lib/ui/SettingsMenu';
import PopUpMenu from '@cdo/apps/lib/ui/PopUpMenu';
import * as maker from '@cdo/apps/lib/kits/maker/toolkit';
import * as assets from '@cdo/apps/code-studio/assets';
import project from '@cdo/apps/code-studio/initApp/project';

describe('SettingsMenu', () => {
  const targetPoint = {left: 0, top:0};
  let handleClose;

  beforeEach(() => {
    handleClose = sinon.spy();
    sinon.stub(assets, 'showAssetManager');
    sinon.stub(project, 'toggleMakerEnabled');
    sinon.stub(maker, 'isAvailable');
    sinon.stub(maker, 'isEnabled');
  });

  afterEach(() => {
    maker.isEnabled.restore();
    maker.isAvailable.restore();
    project.toggleMakerEnabled.restore();
    assets.showAssetManager.restore();
  });

  describe('manage assets', () => {
    it('opens the asset manager and calls handleClose when clicked', () => {
      const wrapper = mount(
        <SettingsMenu
          targetPoint={targetPoint}
          handleClose={handleClose}
        />
      );

      const menuItem = wrapper.find(PopUpMenu.Item).first();
      expect(menuItem.text()).to.equal(msg.manageAssets());

      expect(handleClose).not.to.have.been.called;
      expect(assets.showAssetManager).not.to.have.been.called;
      menuItem.simulate('click');
      expect(handleClose).to.have.been.calledOnce;
      expect(assets.showAssetManager).to.have.been.calledOnce;
    });
  });

  describe('maker toggle', () => {
    it('renders with enable maker option if maker is available and disabled', () => {
      maker.isAvailable.returns(true);
      maker.isEnabled.returns(false);
      const wrapper = mount(
        <SettingsMenu
          targetPoint={targetPoint}
          handleClose={handleClose}
        />
      );
      expect(wrapper.text()).to.include(msg.enableMaker());
    });

    it('renders with enable maker option if maker is available and disabled', () => {
      maker.isAvailable.returns(true);
      maker.isEnabled.returns(true);
      const wrapper = mount(
        <SettingsMenu
          targetPoint={targetPoint}
          handleClose={handleClose}
        />
      );
      expect(wrapper.text()).to.include(msg.disableMaker());
    });

    it('hides maker toggle if maker is not available', () => {
      maker.isAvailable.returns(false);
      const wrapper = mount(
        <SettingsMenu
          targetPoint={targetPoint}
          handleClose={handleClose}
        />
      );
      expect(wrapper.text())
          .not.to.include(msg.enableMaker())
          .and.not.to.include(msg.disableMaker());
    });

    it('calls project.toggleMakerEnabled and handleClose when clicked', () => {
      maker.isAvailable.returns(true);
      maker.isEnabled.returns(false);
      const wrapper = mount(
        <SettingsMenu
          targetPoint={targetPoint}
          handleClose={handleClose}
        />
      );

      // Make sure we grab the right menu item
      const menuItem = wrapper.find(PopUpMenu.Item).last();
      expect(menuItem.text()).to.equal(msg.enableMaker());

      expect(handleClose).not.to.have.been.called;
      expect(project.toggleMakerEnabled).not.to.have.been.called;
      menuItem.simulate('click');
      expect(handleClose).to.have.been.calledOnce;
      expect(project.toggleMakerEnabled).to.have.been.calledOnce;
    });
  });
});

