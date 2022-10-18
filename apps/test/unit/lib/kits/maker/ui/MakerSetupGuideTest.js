/** @file Test SetupGuide component */
import React from 'react';
import {expect} from '../../../../../util/deprecatedChai';
import {shallow} from 'enzyme';
import MakerSetupGuide from '@cdo/apps/lib/kits/maker/ui/MakerSetupGuide';
import applabI18n from '@cdo/applab/locale';
// import experiments from '@cdo/apps/util/experiments';

describe('MakerSetupGuide', () => {
  it('renders circuit playground when experiments are disabled', () => {
    // Ensure we look at microbit
    // before(() => experiments.setEnabled('microbit', true));
    // after(() => experiments.setEnabled('microbit', false));

    const wrapper = shallow(<MakerSetupGuide />);
    const description = wrapper.find('DescriptionCard');
    const markdown = description.shallow().find('SafeMarkdown');
    // Title
    expect(description.prop('title')).to.contain(
      applabI18n.makerSetupCircuitPlaygroundTitle()
    );
    // Markdown content
    expect(markdown.prop('markdown')).to.contain(
      applabI18n.makerSetupCircuitPlaygroundDescription()
    );
  });
});
