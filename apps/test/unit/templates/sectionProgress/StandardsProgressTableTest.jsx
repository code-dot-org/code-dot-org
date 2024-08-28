import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedStandardsProgressTable as StandardsProgressTable} from '../../../../src/templates/sectionProgress/standards/StandardsProgressTable';
import {
  standardsData,
  lessonCompletedByStandard,
} from '../../../../src/templates/sectionProgress/standards/standardsTestHelpers';

describe('StandardsProgressTable', () => {
  it('renders a description cell for each standard', () => {
    const wrapper = mount(
      <StandardsProgressTable
        standards={standardsData}
        lessonsByStandard={lessonCompletedByStandard}
      />
    );
    expect(wrapper.find('StandardDescriptionCell')).toHaveLength(
      standardsData.length
    );
  });
});
