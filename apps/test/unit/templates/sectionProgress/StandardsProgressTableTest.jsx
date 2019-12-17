import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {mount} from 'enzyme';
import {
  fakeStandards,
  lessonCompletedByStandard
} from '../../../../src/templates/sectionProgress/standards/standardsTestHelpers';
import StandardsProgressTable from '../../../../src/templates/sectionProgress/standards/StandardsProgressTable';

describe('StandardsProgressTable', () => {
  it('renders a description cell for each standard', () => {
    const wrapper = mount(
      <StandardsProgressTable
        standards={fakeStandards}
        lessonsCompletedByStandard={lessonCompletedByStandard}
      />
    );
    expect(wrapper.find('StandardDescriptionCell')).to.have.lengthOf(
      fakeStandards.length
    );
  });
});
