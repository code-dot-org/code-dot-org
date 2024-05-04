import {render, screen} from '@testing-library/react';
import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';

import TeacherDashboardNavigation from '@cdo/apps/templates/teacherDashboard/TeacherDashboardNavigation.jsx';

import {expect} from '../../../util/reconfiguredChai';

const CUSTOM_LINKS = [
  {
    label: 'custom link 1',
    url: '/custom_link_1',
  },
  {
    label: 'custom link 2',
    url: '/custom_link_2',
  },
];
const AI_TUTOR_LABEL = 'AI Tutor';
const MANAGE_STUDENTS_LABEL = 'Manage Students';

describe('TeacherDashboardNavigation', () => {
  it('shows standard links with no AI tutor when no props given', () => {
    render(
      <Router>
        <TeacherDashboardNavigation />
      </Router>
    );

    screen.getByText(MANAGE_STUDENTS_LABEL);
    expect(screen.queryByText(AI_TUTOR_LABEL)).to.not.exist;
    CUSTOM_LINKS.forEach(({label}) => {
      expect(screen.queryByText(label)).to.not.exist;
    });
  });

  it('shows standard links with AI tutor', () => {
    render(
      <Router>
        <TeacherDashboardNavigation showAITutorTab={true} />
      </Router>
    );

    screen.getByText(MANAGE_STUDENTS_LABEL);
    screen.getByText(AI_TUTOR_LABEL);
    CUSTOM_LINKS.forEach(({label}) => {
      expect(screen.queryByText(label)).to.not.exist;
    });
  });

  it('shows custom links with no AI tutor', () => {
    render(
      <Router>
        <TeacherDashboardNavigation links={CUSTOM_LINKS} />
      </Router>
    );

    expect(screen.queryByText(MANAGE_STUDENTS_LABEL)).to.not.exist;
    expect(screen.queryByText(AI_TUTOR_LABEL)).to.not.exist;
    CUSTOM_LINKS.forEach(({label}) => {
      screen.getByText(label);
    });
  });

  it('shows custom links with AI tutor', () => {
    render(
      <Router>
        <TeacherDashboardNavigation
          links={CUSTOM_LINKS}
          showAITutorTab={true}
        />
      </Router>
    );

    expect(screen.queryByText(MANAGE_STUDENTS_LABEL)).to.not.exist;
    screen.getByText(AI_TUTOR_LABEL);
    CUSTOM_LINKS.forEach(({label}) => {
      screen.getByText(label);
    });
  });
});
