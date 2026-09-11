import {render, screen} from '@testing-library/react';
import React from 'react';

import {UnconnectedSectionLoginInfo} from '@cdo/apps/templates/teacherDashboard/SectionLoginInfo';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';

describe('SectionLoginInfo', () => {
  const defaultProps = {
    studioUrlPrefix: 'https://studio.code.org',
    section: {
      id: 101,
      loginType: SectionLoginType.picture,
      code: 'ABCDEF',
      name: 'My Section',
    },
    sectionCode: 'ABCDEF',
    students: [],
  };

  afterEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('renders the no-students message instead of crashing when autoPrint fires with no students', () => {
    window.history.replaceState({}, '', '/?autoPrint=true');

    // Without the null guard in printLoginCards, mount threw
    // "Cannot read properties of null (reading 'outerHTML')".
    expect(() =>
      render(<UnconnectedSectionLoginInfo {...defaultProps} />)
    ).not.toThrow();
  });

  it('does not crash when a studentId filter matches no student', () => {
    window.history.replaceState({}, '', '/?studentId=999');

    expect(() =>
      render(
        <UnconnectedSectionLoginInfo
          {...defaultProps}
          students={[{id: 1, name: 'Someone Else', userType: 'student'}]}
        />
      )
    ).not.toThrow();
  });

  it('renders login cards for saved students', () => {
    render(
      <UnconnectedSectionLoginInfo
        {...defaultProps}
        students={[{id: 1, name: 'Saved Student', userType: 'student'}]}
      />
    );

    expect(
      screen.getByRole('button', {name: /Print login cards/})
    ).toBeInTheDocument();
  });
});
