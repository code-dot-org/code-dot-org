/** @file Test SetupGuide component */
import React from 'react';
import {expect} from '../../../../../util/deprecatedChai';
import {shallow} from 'enzyme';
import MakerSetupGuide from '@cdo/apps/lib/kits/maker/ui/MakerSetupGuide';
import applabI18n from '@cdo/applab/locale';
import experiments from '@cdo/apps/util/experiments';

describe('MakerSetupGuide', () => {
  describe('Microbit experiment is not enabled', () => {
    let description;
    let markdown;
    it('renders circuit playground description', () => {
      const wrapper = shallow(<MakerSetupGuide />);
      description = wrapper.findWhere(
        n => n.prop('class') === 'circuit-playground-description'
      );
      expect(description.prop('title')).to.contain(
        applabI18n.makerSetupCircuitPlaygroundTitle()
      );
      markdown = description.shallow().find('SafeMarkdown');
      expect(markdown.prop('markdown')).to.contain(
        applabI18n.makerSetupCircuitPlaygroundDescription()
      );
    });
    it('does not render microbit description', () => {
      const wrapper = shallow(<MakerSetupGuide />);
      description = wrapper.findWhere(
        n => n.prop('class') === 'microbit-description'
      );
      expect(description.isEmpty()).to.equal(true);
    });
  });
  describe('Microbit experiment is enabled', () => {
    let description;
    let markdown;
    before(() => experiments.setEnabled('microbit', true));
    after(() => experiments.setEnabled('microbit', false));
    it('renders circuit playground description', () => {
      const wrapper = shallow(<MakerSetupGuide />);
      description = wrapper.findWhere(
        n => n.prop('class') === 'circuit-playground-description'
      );
      expect(description.prop('title')).to.contain(
        applabI18n.makerSetupCircuitPlaygroundTitle()
      );
      markdown = description.shallow().find('SafeMarkdown');
      expect(markdown.prop('markdown')).to.contain(
        applabI18n.makerSetupCircuitPlaygroundDescription()
      );
    });
    it('renders microbit description description', () => {
      const wrapper = shallow(<MakerSetupGuide />);
      description = wrapper.findWhere(
        n => n.prop('class') === 'microbit-description'
      );
      markdown = description.shallow().find('SafeMarkdown');
      expect(description.prop('title')).to.contain(
        applabI18n.makerSetupMicrobitTitle()
      );
      expect(markdown.prop('markdown')).to.contain(
        applabI18n.makerSetupMicrobitDescription()
      );
    });
  });
});
