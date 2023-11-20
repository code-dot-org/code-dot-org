import React from 'react';
import {shallow} from 'enzyme';
import MakerLanding from '@cdo/apps/templates/MakerLanding';

describe('MakerLanding', () => {
  it('renders', () => {
    const fakeTopCourse = {
      assignableName: 'Maker',
      lessonName: 'Maker Lesson',
      linkToOverview: 'fakelink.com',
      linkToLesson: 'fakelink2.com',
    };

    shallow(<MakerLanding topCourse={fakeTopCourse} />);
  });
});
