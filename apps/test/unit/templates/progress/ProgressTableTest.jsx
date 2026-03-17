import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import DetailProgressTable from '@cdo/apps/templates/progress/DetailProgressTable';
import {
  UnconnectedProgressTable as ProgressTable,
  styles,
} from '@cdo/apps/templates/progress/ProgressTable';
import SummaryProgressTable from '@cdo/apps/templates/progress/SummaryProgressTable';

import {expect} from '../../../util/deprecatedChai'; // eslint-disable-line no-restricted-imports

const FAKE_LESSONS = [];
const FAKE_LEVELS = [];
const FAKE_LESSON_1 = {
  lessonGroup: {displayName: 'jazz', userFacing: false},
  lessons: FAKE_LESSONS,
  levelsByLesson: FAKE_LEVELS,
};
const FAKE_LESSON_2 = {
  lessonGroup: {displayName: 'samba', userFacing: true},
  lessons: FAKE_LESSONS,
  levelsByLesson: FAKE_LEVELS,
};

const FAKE_LESSON_3 = {
  lessonGroup: {displayName: 'dance', userFacing: true},
  lessons: FAKE_LESSONS,
  levelsByLesson: FAKE_LEVELS,
};

const DEFAULT_PROPS = {
  isPlc: false,
  isSummaryView: false,
  groupedLessons: [FAKE_LESSON_1],
};

describe('ProgressTable', () => {
  it('renders a single lesson with user facing lesson group in full view', () => {
    const wrapper = shallow(
      <ProgressTable {...DEFAULT_PROPS} groupedLessons={[FAKE_LESSON_3]} />,
      {
        disableLifecycleMethods: true,
      }
    );
    expect(wrapper.find('div').first().children()).to.have.lengthOf(1);
  });

  it('renders a single lesson without user facing lesson group in full view', () => {
    const wrapper = shallow(
      <ProgressTable {...DEFAULT_PROPS} isSummaryView={false} />,
      {disableLifecycleMethods: true}
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <div style={styles.hidden}>
          <SummaryProgressTable groupedLesson={FAKE_LESSON_1} />
        </div>
        <div style={{}}>
          <DetailProgressTable groupedLesson={FAKE_LESSON_1} />
        </div>
      </div>
    );
  });

  it('renders a single lesson without user facing lesson group in summary view', () => {
    const wrapper = shallow(
      <ProgressTable {...DEFAULT_PROPS} isSummaryView={true} />,
      {disableLifecycleMethods: true}
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <div style={{}}>
          <SummaryProgressTable groupedLesson={FAKE_LESSON_1} />
        </div>
        <div style={styles.hidden}>
          <DetailProgressTable groupedLesson={FAKE_LESSON_1} />
        </div>
      </div>
    );
  });

  it('renders multiple lessons as lesson group sections', () => {
    const wrapper = shallow(
      <ProgressTable
        {...DEFAULT_PROPS}
        groupedLessons={[FAKE_LESSON_3, FAKE_LESSON_2]}
      />,
      {disableLifecycleMethods: true}
    );
    expect(wrapper.find('div').first().children()).to.have.lengthOf(2);
  });
});
