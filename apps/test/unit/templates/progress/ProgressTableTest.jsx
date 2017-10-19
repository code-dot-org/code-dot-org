import React from 'react';
import {expect} from '../../../util/configuredChai';
import {shallow} from 'enzyme';
import {
  UnconnectedProgressTable as ProgressTable,
  styles,
} from '@cdo/apps/templates/progress/ProgressTable';
import SummaryProgressTable from '@cdo/apps/templates/progress/SummaryProgressTable';
import DetailProgressTable from '@cdo/apps/templates/progress/DetailProgressTable';
import ProgressGroup from '@cdo/apps/templates/progress/ProgressGroup';

const FAKE_LESSONS = [];
const FAKE_LEVELS = [];
const FAKE_LESSON_1 = {
  category: 'jazz',
  lessons: FAKE_LESSONS,
  levels: FAKE_LEVELS
};
const FAKE_LESSON_2 = {
  category: 'samba',
  lessons: FAKE_LESSONS,
  levels: FAKE_LEVELS
};
const DEFAULT_PROPS = {
  isPlc: false,
  isSummaryView: false,
  categorizedLessons: [
    FAKE_LESSON_1
  ]
};

describe('ProgressTable', () => {
  it('renders a single lesson in full view', () => {
    const wrapper = shallow(
      <ProgressTable
        {...DEFAULT_PROPS}
        isSummaryView={false}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <div style={styles.hidden}>
          <SummaryProgressTable
            lessons={FAKE_LESSONS}
            levelsByLesson={FAKE_LEVELS}
          />
        </div>
        <div style={{}}>
          <DetailProgressTable
            lessons={FAKE_LESSONS}
            levelsByLesson={FAKE_LEVELS}
          />
        </div>
      </div>
    );
  });

  it('renders a single lesson in summary view', () => {
    const wrapper = shallow(
      <ProgressTable
        {...DEFAULT_PROPS}
        isSummaryView={true}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <div style={{}}>
          <SummaryProgressTable
            lessons={FAKE_LESSONS}
            levelsByLesson={FAKE_LEVELS}
          />
        </div>
        <div style={styles.hidden}>
          <DetailProgressTable
            lessons={FAKE_LESSONS}
            levelsByLesson={FAKE_LEVELS}
          />
        </div>
      </div>
    );
  });

  it('renders multiple lessons as ProgressGroups', () => {
    const wrapper = shallow(
      <ProgressTable
        {...DEFAULT_PROPS}
        categorizedLessons={[
          FAKE_LESSON_1,
          FAKE_LESSON_2
        ]}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <div>
        <ProgressGroup
          key={FAKE_LESSON_1.category}
          isPlc={DEFAULT_PROPS.isPlc}
          groupName={FAKE_LESSON_1.category}
          isSummaryView={DEFAULT_PROPS.isSummaryView}
          lessons={FAKE_LESSON_1.lessons}
          levelsByLesson={FAKE_LESSON_1.levels}
        />
        <ProgressGroup
          key={FAKE_LESSON_2.category}
          isPlc={DEFAULT_PROPS.isPlc}
          groupName={FAKE_LESSON_2.category}
          isSummaryView={DEFAULT_PROPS.isSummaryView}
          lessons={FAKE_LESSON_2.lessons}
          levelsByLesson={FAKE_LESSON_2.levels}
        />
      </div>
    );
  });
});
