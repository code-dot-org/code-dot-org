/** @file Test SetupGuide component */
import React from 'react';
import {expect} from '../../../../../util/deprecatedChai';
import {shallow} from 'enzyme';
import SetupGuide from '@cdo/apps/lib/kits/maker/ui/SetupGuide';
import applabI18n from '@cdo/applab/locale';
import experiments from '@cdo/apps/util/experiments';

describe('MakerSetupGuide', () => {
  describe('Microbit experiment is not enabled', () => {
    it('renders circuit playground description', () => {
      let [description, markdown] = getGuideContent(
        '#circuit-playground-description'
      );
      expect(description.prop('title')).to.contain(
        applabI18n.makerSetupCircuitPlaygroundTitle()
      );
      expect(markdown.prop('markdown')).to.contain(
        applabI18n.makerSetupCircuitPlaygroundDescription()
      );
    });
    it('does not render microbit description', () => {
      let [description, markdown] = getGuideContent('#microbit-description');
      expect(description.exists()).to.equal(false);
      expect(markdown).to.equal(null);
    });
  });
  describe('Microbit experiment is enabled', () => {
    before(() => experiments.setEnabled('microbit', true));
    after(() => experiments.setEnabled('microbit', false));

    it('renders circuit playground description', () => {
      let [description, markdown] = getGuideContent(
        '#circuit-playground-description'
      );
      expect(description.prop('title')).to.contain(
        applabI18n.makerSetupCircuitPlaygroundTitle()
      );
      expect(markdown.prop('markdown')).to.contain(
        applabI18n.makerSetupCircuitPlaygroundDescription()
      );
    });

    it('renders microbit description description', () => {
      let [description, markdown] = getGuideContent('#microbit-description');
      expect(description.prop('title')).to.contain(
        applabI18n.makerSetupMicrobitTitle()
      );
      expect(markdown.prop('markdown')).to.contain(
        applabI18n.makerSetupMicrobitDescription()
      );
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
