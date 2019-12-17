import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import StandardDescriptionCell from '@cdo/apps/templates/sectionProgress/standards/StandardDescriptionCell';
import {
  fakeStandards,
  lessonCompletedByStandard
} from '@cdo/apps/templates/sectionProgress/standards/standardsTestHelpers';

describe('StandardDescriptionCell', () => {
  let DEFAULT_PROPS = {
    description: fakeStandards[1].description,
    lessonsForStandardStatus: lessonCompletedByStandard[1].lessons
  };

  it('standards view shows StandardsIntroDialog', () => {
    const wrapper = shallow(<StandardDescriptionCell {...DEFAULT_PROPS} />);
    expect(wrapper.find('ProgressBoxForLessonNumber')).to.have.lengthOf(
      lessonCompletedByStandard[1].lessons.length
    );
  });
});
