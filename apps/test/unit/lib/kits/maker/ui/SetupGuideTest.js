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
      makerSetupGeneralTitle: 'i18n-general-title',
      makerSetupGeneralDescription: 'i18n-general-description',
    };

    for (const key in i18n) {
      sinon.stub(applabI18n, key).returns(i18n[key]);
    }
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('General description displayed correctly', () => {
    it('uses localized general description', () => {
      let [description, markdown] = getGuideContent('#general-description');
      expect(description.prop('title')).to.contain('i18n-general-title');
      expect(markdown.prop('markdown')).to.contain('i18n-general-description');
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
