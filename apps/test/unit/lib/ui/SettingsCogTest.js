import React from 'react';
import {shallow, mount} from 'enzyme';
import sinon from 'sinon';
import msg from '@cdo/locale';
import {expect} from '../../../util/reconfiguredChai';
import {renderMakerButton, SettingsCog} from '@cdo/apps/lib/ui/SettingsCog';
import JavalabDropdown from '@cdo/apps/javalab/components/JavalabDropdown';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import * as makerRedux from '@cdo/apps/lib/kits/maker/redux';
import * as assets from '@cdo/apps/code-studio/assets';
import pageConstantsReducer, {
  setPageConstants,
} from '@cdo/apps/redux/pageConstants';
import {Provider} from 'react-redux';
import {
  getStore,
  registerReducers,
  __testing_stubRedux,
  __testing_restoreRedux,
} from '@cdo/apps/redux';

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
    const wrapper = mount(<SettingsCog showMakerToggle={false} />);
    wrapper.instance().open();
    wrapper.update();
    expect(wrapper.text()).to.not.include(msg.enableMaker());
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
        let settings = shallow(<SettingsCog showMakerToggle={true} />);
        expect(settings.state().confirmingEnableMaker).to.be.false;
        settings.instance().toggleMakerToolkit();
        settings.update();
        expect(settings.state().confirmingEnableMaker).to.be.true;
      });
    });

    describe('curriculum level vs standalone project - maker toolkit enabled', () => {
      beforeEach(() => {
        sinon.stub(makerRedux, 'isAvailable');
        sinon.stub(makerRedux, 'isEnabled');
        __testing_stubRedux();
        registerReducers({pageConstants: pageConstantsReducer});
        makerRedux.isAvailable.returns(true);
        makerRedux.isEnabled.returns(true);
      });

      afterEach(() => {
        makerRedux.isEnabled.restore();
        makerRedux.isAvailable.restore();
        __testing_restoreRedux();
      });

      it('does not display maker toggle if a curriculum level', () => {
        getStore().dispatch(
          setPageConstants({
            isCurriculumLevel: true,
          })
        );
        let wrapper = mount(
          <Provider store={getStore()}>
            <SettingsCog showMakerToggle={true} />
          </Provider>
        );
        let settings = wrapper.find('SettingsCog');
        settings.instance().open();
        settings.update();
        expect(settings.text()).to.not.include(msg.disableMaker());
      });

      it('does display maker toggle if not a curriculum level (standalone project)', () => {
        getStore().dispatch(
          setPageConstants({
            isCurriculumLevel: false,
          })
        );
        let wrapper = mount(
          <Provider store={getStore()}>
            <SettingsCog showMakerToggle={true} />
          </Provider>
        );
        let settings = wrapper.find('SettingsCog');
        settings.instance().open();
        settings.update();
        expect(settings.text()).to.include(msg.disableMaker());
      });
    });
  });
});
