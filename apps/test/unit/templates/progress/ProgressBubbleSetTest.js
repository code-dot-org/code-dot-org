import { assert } from '../../../util/configuredChai';
import React from 'react';
import { shallow } from 'enzyme';
import ProgressBubbleSet from '@cdo/apps/templates/progress/ProgressBubbleSet';
import { fakeLevels } from '@cdo/apps/templates/progress/progressTestHelpers';

const defaultProps = {
  levels: fakeLevels(5),
  disabled: false
};

describe('ProgressBubbleSet', () => {
  it('we have a bubble for each level', () => {
    const wrapper = shallow(
      <ProgressBubbleSet
        {...defaultProps}
      />
    );
    assert.equal(wrapper.find('ProgressBubble').length, defaultProps.levels.length);
  });
});
