/** @file Test InfoHelpTip component */
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import ReactTooltip from 'react-tooltip';

import InfoHelpTip from '@cdo/apps/sharedComponents/InfoHelpTip';

describe('InfoHelpTip', () => {
  const DEFAULT_PROPS = {
    id: 'test-id',
    content: 'test content',
  };

  it('renders FontAwesomeV6Icon', () => {
    const wrapper = shallow(<InfoHelpTip {...DEFAULT_PROPS} />);
    expect(wrapper.find(FontAwesomeV6Icon)).toHaveLength(1);
    expect(wrapper.find(FontAwesomeV6Icon).props().iconName).toBe(
      'circle-info'
    );
  });

  it('renders ReactTooltip', () => {
    const wrapper = shallow(<InfoHelpTip {...DEFAULT_PROPS} />);
    expect(wrapper.find(ReactTooltip)).toHaveLength(1);
    expect(wrapper.find(ReactTooltip).props().id).toBe('test-id');
    expect(wrapper.find(Typography)).toHaveLength(1);
    expect(wrapper.find(Typography).at(0).props().children).toBe(
      'test content'
    );
  });
});
