import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';

import * as assets from '@cdo/apps/code-studio/assets';
import JavalabDropdown from '@cdo/apps/javalab/components/JavalabDropdown';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import * as makerRedux from '@cdo/apps/lib/kits/maker/redux';
import {renderMakerButton, SettingsCog} from '@cdo/apps/lib/ui/SettingsCog';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import pageConstantsReducer, {
  setPageConstants,
} from '@cdo/apps/redux/pageConstants';
import msg from '@cdo/locale';

describe('SettingsCog', () => {
  it('renders as a FontAwesome icon', () => {
    const wrapper = shallow(<SettingsCog />);
    expect(wrapper.find(FontAwesome)).toHaveLength(1);
  });

  it('opens the menu when the cog is clicked', () => {
    const wrapper = shallow(<SettingsCog />);
    expect(wrapper.find(JavalabDropdown)).toHaveLength(0);
    wrapper.instance().open();
    wrapper.update();
    expect(wrapper.find(JavalabDropdown)).toHaveLength(1);
  });

  it('can close the menu', () => {
    const wrapper = shallow(<SettingsCog />);
    wrapper.instance().open();
    wrapper.update();
    expect(wrapper.find(JavalabDropdown)).toHaveLength(1);
    wrapper.instance().close();
    wrapper.update();
    expect(wrapper.find(JavalabDropdown)).toHaveLength(0);
  });

  it('does not show maker toggle when "showMakerToggle" is false', () => {
    const wrapper = mount(<SettingsCog showMakerToggle={false} />);
    wrapper.instance().open();
    wrapper.update();
    expect(wrapper.text()).not.toContain(msg.enableMaker());
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
        jest.spyOn(assets, 'showAssetManager').mockClear().mockImplementation();
      });

      afterEach(() => {
        assets.showAssetManager.mockRestore();
      });

      it('calls showAssetManager when clicked', () => {
        expect(assets.showAssetManager).not.toHaveBeenCalled();
        wrapper.instance().manageAssets();
        wrapper.update();
        expect(assets.showAssetManager).toHaveBeenCalledTimes(1);
      });

      it('closes the menu when clicked', () => {
        wrapper.instance().manageAssets();
        wrapper.update();
        expect(wrapper.find(JavalabDropdown)).toHaveLength(0);
      });
    });

    describe('maker toggle', () => {
      beforeEach(() => {
        jest.spyOn(makerRedux, 'isAvailable').mockClear().mockImplementation();
        jest.spyOn(makerRedux, 'isEnabled').mockClear().mockImplementation();
      });

      afterEach(() => {
        makerRedux.isEnabled.mockRestore();
        makerRedux.isAvailable.mockRestore();
      });

      it('renders with enable maker option if maker is available and disabled', () => {
        makerRedux.isAvailable.mockReturnValue(true);
        makerRedux.isEnabled.mockReturnValue(false);
        const wrapper = shallow(renderMakerButton(() => {}));
        expect(wrapper.text()).toContain(msg.enableMaker());
      });

      it('renders with disable maker option if maker is available and enabled', () => {
        makerRedux.isAvailable.mockReturnValue(true);
        makerRedux.isEnabled.mockReturnValue(true);
        const wrapper = shallow(renderMakerButton(() => {}));
        expect(wrapper.text()).toContain(msg.disableMaker());
      });

      it('hides maker toggle if maker is not available', () => {
        makerRedux.isAvailable.mockReturnValue(false);
        expect(renderMakerButton(() => {})).toBeNull();
      });

      it('asks for confirmation when clicked', () => {
        makerRedux.isAvailable.mockReturnValue(true);
        makerRedux.isEnabled.mockReturnValue(false);
        let settings = shallow(<SettingsCog showMakerToggle={true} />);
        expect(settings.state().confirmingEnableMaker).toBe(false);
        settings.instance().toggleMakerToolkit();
        settings.update();
        expect(settings.state().confirmingEnableMaker).toBe(true);
      });
    });

    describe('curriculum level vs standalone project - maker toolkit enabled', () => {
      beforeEach(() => {
        jest.spyOn(makerRedux, 'isAvailable').mockClear().mockImplementation();
        jest.spyOn(makerRedux, 'isEnabled').mockClear().mockImplementation();
        stubRedux();
        registerReducers({pageConstants: pageConstantsReducer});
        makerRedux.isAvailable.mockReturnValue(true);
        makerRedux.isEnabled.mockReturnValue(true);
      });

      afterEach(() => {
        makerRedux.isEnabled.mockRestore();
        makerRedux.isAvailable.mockRestore();
        restoreRedux();
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
        expect(settings.text()).not.toContain(msg.disableMaker());
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
        expect(settings.text()).toContain(msg.disableMaker());
      });
    });
  });
});
