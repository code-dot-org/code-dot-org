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
      />
    );

    wrapper
      .find('Button')
      .at(0)
      .simulate('click');
    expect(wrapper.find('LessonStatusDialog')).to.have.length(1);
  });
  it('opens create report dialog', () => {
    const wrapper = shallow(
      <StandardsViewHeaderButtons
        sectionId={1}
        setTeacherCommentForReport={() => {}}
      />
    );

    wrapper
      .find('Button')
      .at(1)
      .simulate('click');
    expect(wrapper.find('CreateStandardsReportDialog')).to.have.length(1);
  });
});
