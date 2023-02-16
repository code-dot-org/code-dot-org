import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import msg from '@cdo/locale';
import {expect} from '../../../util/reconfiguredChai';
import {renderMakerButton, SettingsCog} from '@cdo/apps/lib/ui/SettingsCog';
import JavalabDropdown from '@cdo/apps/javalab/components/JavalabDropdown';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import * as makerRedux from '@cdo/apps/lib/kits/maker/redux';
import * as assets from '@cdo/apps/code-studio/assets';

describe('SettingsCog', () => {
  it('renders as a FontAwesome icon', () => {
    const wrapper = shallow(<SettingsCog />);
    expect(wrapper.find(FontAwesome)).to.have.lengthOf(1);
  });

  it('opens the menu when the cog is clicked', () => {
    const wrapper = shallow(<SettingsCog />);
    expect(wrapper.find(JavalabDropdown)).to.be.empty;
    wrapper.instance().open();
    wrapper.update();
    expect(wrapper.find(JavalabDropdown)).to.have.lengthOf(1);
  });

  it('can close the menu', () => {
    const wrapper = shallow(<SettingsCog />);
    wrapper.instance().open();
    wrapper.update();
    expect(wrapper.find(JavalabDropdown)).to.have.lengthOf(1);
    wrapper.instance().close();
    wrapper.update();
    expect(wrapper.find(JavalabDropdown)).to.be.empty;
  });

  it('does not show maker toggle when "showMakerToggle" is false', () => {
    const wrapper = shallow(<SettingsCog showMakerToggle={false} />);
    expect(wrapper.text()).to.not.include(msg.enableMaker());
    expect(wrapper.text()).to.not.include(msg.disableMaker());
  });

  describe('menu items', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallow(<SettingsCog showMakerToggle={true} />);
      wrapper.instance().open();
      wrapper.update();
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
        expect(wrapper.find(JavalabDropdown)).to.be.empty;
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
        const wrapper = shallow(renderMakerButton(() => {}));
        expect(wrapper.text()).to.include(msg.enableMaker());
      });

      it('renders with disable maker option if maker is available and enabled', () => {
        makerRedux.isAvailable.returns(true);
        makerRedux.isEnabled.returns(true);
        const wrapper = shallow(renderMakerButton(() => {}));
        expect(wrapper.text()).to.include(msg.disableMaker());
      });

      it('hides maker toggle if maker is not available', () => {
        makerRedux.isAvailable.returns(false);
        expect(renderMakerButton(() => {})).to.be.null;
      });

      it('asks for confirmation when clicked', () => {
        makerRedux.isAvailable.returns(true);
        makerRedux.isEnabled.returns(false);
        var settings = shallow(<SettingsCog showMakerToggle={true} />);
        expect(settings.state().confirmingEnableMaker).to.be.false;
        settings.instance().toggleMakerToolkit();
        settings.update();
        expect(settings.state().confirmingEnableMaker).to.be.true;
      });

      // it('hides maker toggle when "showMakerToggle" is true but project is a curriculum level', () => {
      //   makerRedux.isAvailable.returns(true);
      //   makerRedux.isEnabled.returns(true);
      // });

      // it('does show maker toggle when "showMakerToggle" is true but project is not a curriculum level', () => {
      //   const wrapper = shallow(
      //     isCurriculumLevel(() => {
      //       return false;
      //     })
      //   );
      // });
    });
  });
});
