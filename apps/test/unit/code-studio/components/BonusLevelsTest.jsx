import React from 'react';
import {shallow} from 'enzyme';
import {assert} from '../../../util/reconfiguredChai';
import {bonusLevels} from './lessonExtrasTestHelpers';
import BonusLevels from '@cdo/apps/code-studio/components/lessonExtras/BonusLevels';

const DEFAULT_PROPS = {
  bonusLevels: bonusLevels,
  sectionId: null,
  userId: null
};

describe('BonusLevels', () => {
  it('renders correct number of bonus levels', () => {
    const wrapper = shallow(<BonusLevels {...DEFAULT_PROPS} />);
    assert.equal(7, wrapper.find('SublevelCard').length);
  });
});
