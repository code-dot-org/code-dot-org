import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import StandardDescriptionCell from '@cdo/apps/templates/sectionProgress/standards/StandardDescriptionCell';
import {
  standardsData,
  lessonCompletedByStandard
} from '@cdo/apps/templates/sectionProgress/standards/standardsTestHelpers';

describe('StandardDescriptionCell', () => {
  let DEFAULT_PROPS = {
    description: standardsData[1].description,
    lessonsForStandardStatus: lessonCompletedByStandard[1],
    isViewingReport: null
  };

  it('shows the correct number of progress boxes for lessons', () => {
    const wrapper = shallow(<StandardDescriptionCell {...DEFAULT_PROPS} />);
    expect(
      wrapper.find('Connect(ProgressBoxForLessonNumber)')
    ).to.have.lengthOf(lessonCompletedByStandard[1].length);
  });
  it('does not show the tooltip in the standards report view', () => {
    const wrapper = shallow(
      <StandardDescriptionCell {...DEFAULT_PROPS} isViewingReport={true} />
    );
    expect(wrapper.find('ReactTooltip')).to.have.lengthOf(0);
  });
  it('shows the tooltips for each lesson when not viewing the standards report', () => {
    const wrapper = shallow(<StandardDescriptionCell {...DEFAULT_PROPS} />);
    expect(wrapper.find('ReactTooltip')).to.have.lengthOf(
      lessonCompletedByStandard[1].length
    );
  });
});
