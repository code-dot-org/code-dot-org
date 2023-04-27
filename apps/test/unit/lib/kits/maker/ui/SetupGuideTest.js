/** @file Test SetupGuide component */
import React from 'react';
import {expect} from '../../../../../util/deprecatedChai';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import SetupGuide from '@cdo/apps/lib/kits/maker/ui/SetupGuide';
import applabI18n from '@cdo/applab/locale';

describe('MakerSetupGuide', () => {
  beforeEach(() => {
    // Stub i18n function before translation tests.
    const i18n = {
      makerSetupCircuitPlaygroundTitle: 'i18n-CP-title',
      makerSetupCircuitPlaygroundDescription: 'i18n-CP-description',
      makerSetupMicrobitTitle: 'i18n-MB-title',
      makerSetupMicrobitDescription: 'i18n-MB-description',
    };

    for (const key in i18n) {
      sinon.stub(applabI18n, key).returns(i18n[key]);
    }
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Device descriptions displayed correctly', () => {
    it('uses localized circuit playground description', () => {
      let [description, markdown] = getGuideContent(
        '#circuit-playground-description'
      );
      expect(description.prop('title')).to.contain('i18n-CP-title');
      expect(markdown.prop('markdown')).to.contain('i18n-CP-description');
    });

    it('uses localized microbit description', () => {
      let [description, markdown] = getGuideContent('#microbit-description');
      expect(description.prop('title')).to.contain('i18n-MB-title');
      expect(markdown.prop('markdown')).to.contain('i18n-MB-description');
    });
  });

  /**
   * Finds description and markdown wrappers from SetupGuide by elementId
   * @param {string} elementId
   * @returns if nothing is monitoring the given analog pin
   */
  function getGuideContent(elementId) {
    const wrapper = shallow(<SetupGuide />);
    const description = wrapper.find(elementId).first();
    const markdown = description.exists()
      ? description.shallow().find('SafeMarkdown')
      : null;
    return [description, markdown];
  }
});
