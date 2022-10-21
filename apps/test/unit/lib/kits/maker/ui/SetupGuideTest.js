/** @file Test SetupGuide component */
import React from 'react';
import {expect} from '../../../../../util/deprecatedChai';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import SetupGuide from '@cdo/apps/lib/kits/maker/ui/SetupGuide';
import applabI18n from '@cdo/applab/locale';
import experiments from '@cdo/apps/util/experiments';

describe('MakerSetupGuide', () => {
  sinon
    .stub(applabI18n, 'makerSetupCircuitPlaygroundTitle')
    .returns('i18n-CP-title');
  sinon
    .stub(applabI18n, 'makerSetupCircuitPlaygroundDescription')
    .returns('i18n-CP-description');
  sinon.stub(applabI18n, 'makerSetupMicrobitTitle').returns('i18n-MB-title');
  sinon
    .stub(applabI18n, 'makerSetupMicrobitDescription')
    .returns('i18n-MB-description');

  describe('Microbit experiment is not enabled', () => {
    it('renders circuit playground description', () => {
      let [description, markdown] = getGuideContent(
        '#circuit-playground-description'
      );
      expect(description.prop('title')).to.contain('i18n-CP-title');
      expect(markdown.prop('markdown')).to.contain('i18n-CP-description');
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
      expect(description.prop('title')).to.contain('i18n-CP-title');
      expect(markdown.prop('markdown')).to.contain('i18n-CP-description');
    });

    it('renders microbit description description', () => {
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
