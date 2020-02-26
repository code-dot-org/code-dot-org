import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedStandardsViewHeaderButtons as StandardsViewHeaderButtons} from '@cdo/apps/templates/sectionProgress/standards/StandardsViewHeaderButtons';

describe('StandardsViewHeaderButtons', () => {
  it('opens lesson status dialog', () => {
    const wrapper = shallow(
      <StandardsViewHeaderButtons
        sectionId={1}
        setTeacherCommentForReport={() => {}}
        scriptId={100}
        selectedLessons={() => {}}
        unpluggedLessons={() => {}}
      />
    );

    wrapper
      .find('Button')
      .at(0)
      .simulate('click');
    expect(wrapper.find('Connect(LessonStatusDialog)')).to.have.lengthOf(1);
  });
  it('opens create report dialog', () => {
    const wrapper = shallow(
      <StandardsViewHeaderButtons
        sectionId={1}
        setTeacherCommentForReport={() => {}}
        scriptId={100}
        selectedLessons={() => {}}
        unpluggedLessons={() => {}}
      />
    );

    wrapper
      .find('Button')
      .at(1)
      .simulate('click');
    expect(wrapper.find('CreateStandardsReportDialog')).to.have.length(1);
  });
});
