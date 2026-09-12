import {render, screen} from '@testing-library/react';
import React from 'react';

import {UnconnectedSectionLoginInfo} from '@cdo/apps/templates/teacherDashboard/SectionLoginInfo';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

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

  const renderWithLoginType = loginType =>
    render(
      <UnconnectedSectionLoginInfo
        studioUrlPrefix="https://studio.code.org"
        section={{id: 42, loginType, code: 'CL-2222|33333'}}
        students={[]}
        isDemoSection={false}
        sectionCode="CL-2222|33333"
      />
    );

  it('renders sign-in instructions and the sync section for ClassLink', () => {
    renderWithLoginType('classlink');

    screen.getByText('Signing in with ClassLink');
    screen.getByText(i18n.syncingYourStudents());
    // The sync description names the provider's sync button.
    screen.getByText(/Sync students from ClassLink/);
  });

  it('omits the sync screenshot for ClassLink until an asset exists', () => {
    renderWithLoginType('classlink');

    expect(screen.queryByAltText(i18n.syncingYourStudents())).toBeNull();
  });

  it('still renders the sync screenshot for Clever', () => {
    renderWithLoginType('clever');

    screen.getByText(i18n.signingInClever());
    expect(screen.getByAltText(i18n.syncingYourStudents())).toBeTruthy();
  });
});
