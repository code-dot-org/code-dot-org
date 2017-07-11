import { assert } from '../../../util/configuredChai';
import { throwOnConsoleErrors, throwOnConsoleWarnings } from '../../../util/testUtils';
import React from 'react';
import { shallow } from 'enzyme';
import { UnconnectedSectionTable as SectionTable }
  from '@cdo/apps/templates/teacherDashboard/SectionTable';

describe('SectionTable', () => {
  throwOnConsoleErrors();
  throwOnConsoleWarnings();

  it('has one SectionRow per passed in section', () => {
    const wrapper = shallow(
      <SectionTable
        sectionIds={[1,2,3]}
      />
    );
    const rows = wrapper.find('Connect(SectionRow)');
    assert.equal(rows.length, 3);
  });
});
