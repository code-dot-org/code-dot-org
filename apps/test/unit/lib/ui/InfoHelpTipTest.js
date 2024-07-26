/** @file Test InfoHelpTip component */
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import ReactTooltip from 'react-tooltip';

import {BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import InfoHelpTip from '@cdo/apps/lib/ui/InfoHelpTip';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

// "it renders" test that checks for FontAwesome and ReactTooltip

describe('InfoHelpTip', () => {
  const DEFAULT_PROPS = {
    id: 'test-id',
    content: 'test content',
  };

  it('renders FontAwesome', () => {
    const wrapper = shallow(<InfoHelpTip {...DEFAULT_PROPS} />);
    expect(wrapper.find(FontAwesome)).toHaveLength(1);
    expect(wrapper.find(FontAwesome).props().icon).toBe('info-circle');
  });

  it('renders ReactTooltip', () => {
    const wrapper = shallow(<InfoHelpTip {...DEFAULT_PROPS} />);
    expect(wrapper.find(ReactTooltip)).toHaveLength(1);
    expect(wrapper.find(ReactTooltip).props().id).toBe('test-id');
    expect(wrapper.find(BodyTwoText)).toHaveLength(1);
    expect(wrapper.find(BodyTwoText).at(0).props().children).toBe(
      'test content'
    );
  });
});
