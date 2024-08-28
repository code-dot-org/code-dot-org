import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import RollupLessonEntry from '@cdo/apps/templates/courseRollupPages/RollupLessonEntry';

import {courseData} from './rollupTestData';

describe('RollupLessonEntry', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      objectToRollUp: 'Code',
      lesson: courseData.units[0].lessons[0],
    };
  });

  it('renders one RollupLessonEntry usually', () => {
    const wrapper = shallow(<RollupLessonEntry {...defaultProps} />);

    expect(wrapper.find('RollupLessonEntrySection').length).toBe(1);
  });

  it('renders two RollupLessonEntry sections for resources', () => {
    const wrapper = shallow(
      <RollupLessonEntry {...defaultProps} objectToRollUp={'Resources'} />
    );

    expect(wrapper.find('RollupLessonEntrySection').length).toBe(2);
  });
});
