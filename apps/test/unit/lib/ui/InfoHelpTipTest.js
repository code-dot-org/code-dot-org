/** @file Test InfoHelpTip component */
import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import InfoHelpTip from '@cdo/apps/lib/ui/InfoHelpTip';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import ReactTooltip from 'react-tooltip';

// "it renders" test that checks for FontAwesome and ReactTooltip

describe('InfoHelpTip', () => {
  const DEFAULT_PROPS = {
    id: 'test-id',
    content: 'test content',
  };

  it('renders FontAwesome', () => {
    const wrapper = shallow(<InfoHelpTip {...DEFAULT_PROPS} />);
    expect(wrapper.find(FontAwesome)).to.have.lengthOf(1);
    expect(wrapper.find(FontAwesome).props().icon).to.equal('info-circle');
  });

  it('renders ReactTooltip', () => {
    const wrapper = shallow(<InfoHelpTip {...DEFAULT_PROPS} />);
    expect(wrapper.find(ReactTooltip)).to.have.lengthOf(1);
    expect(wrapper.find(ReactTooltip).props().id).to.equal('test-id');
    expect(wrapper.find(ReactTooltip).children().text()).to.equal(
      'test content'
    );
  });
});
