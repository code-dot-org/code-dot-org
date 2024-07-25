import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedStandardsViewHeaderButtons as StandardsViewHeaderButtons} from '@cdo/apps/templates/sectionProgress/standards/StandardsViewHeaderButtons';

describe('StandardsViewHeaderButtons', () => {
  it('does not show update unplugged progress button if no unplugged lessons', () => {
    const wrapper = shallow(
      <StandardsViewHeaderButtons
        sectionId={1}
        setTeacherCommentForReport={() => {}}
        scriptId={100}
        selectedLessons={[]}
        unpluggedLessons={[]}
      />
    );
    expect(wrapper.find('Button')).toHaveLength(1);
  });
  it('opens lesson status dialog', () => {
    const wrapper = shallow(
      <StandardsViewHeaderButtons
        sectionId={1}
        setTeacherCommentForReport={() => {}}
        scriptId={100}
        selectedLessons={[]}
        unpluggedLessons={[
          {
            id: 2,
            name: 'Lesson Name',
            number: 1,
            url: 'fakeurl.com',
          },
        ]}
      />
    );

    wrapper.find('Button').at(0).simulate('click');
    expect(wrapper.find('LessonStatusDialog')).toHaveLength(1);
  });
  it('opens create report dialog', () => {
    const wrapper = shallow(
      <StandardsViewHeaderButtons
        sectionId={1}
        setTeacherCommentForReport={() => {}}
        scriptId={100}
        selectedLessons={[]}
        unpluggedLessons={[
          {
            id: 2,
            name: 'Lesson Name',
            number: 1,
            url: 'fakeurl.com',
          },
        ]}
      />
    );

    wrapper.find('Button').at(1).simulate('click');
    expect(wrapper.find('CreateStandardsReportDialog')).toHaveLength(1);
  });
});
