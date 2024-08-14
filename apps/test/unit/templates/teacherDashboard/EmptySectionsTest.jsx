import {render, screen} from '@testing-library/react';
import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';

import EmptySection from '@cdo/apps/templates/teacherDashboard/EmptySectionV1';
import i18n from '@cdo/locale';

const TEST_ELEMENT_TEXT = 'Test Element';

describe('EmptySection', () => {
  it('displays empty desk image and Add Students link when there are no students', () => {
    render(
      <Router>
        <EmptySection
          hasStudents={false}
          hasCurriculumAssigned={false}
          element={<div>{TEST_ELEMENT_TEXT}</div>}
        />
      </Router>
    );

    screen.getByAltText('empty desk');
    screen.getByText(i18n.addStudents());
    expect(screen.queryByAltText('blank screen')).toBeNull();
    expect(screen.queryByText(i18n.browseCurriculum())).toBeNull();
    expect(screen.queryByText(TEST_ELEMENT_TEXT)).toBeNull();
  });

  it('displays blank screen image and Browse Curriculum button when there are students but no curriculum assigned', () => {
    render(
      <Router>
        <EmptySection
          hasStudents={true}
          hasCurriculumAssigned={false}
          element={<div>{TEST_ELEMENT_TEXT}</div>}
        />
      </Router>
    );

    screen.getByAltText('blank screen');
    screen.getByText(i18n.browseCurriculum());
    expect(screen.queryByAltText('empty desk')).toBeNull();
    expect(screen.queryByText(i18n.addStudents())).toBeNull();
    expect(screen.queryByText(TEST_ELEMENT_TEXT)).toBeNull();
  });

  it('displays empty desk image and Add Students button when there are no students but there is a curriculum assigned', () => {
    render(
      <Router>
        <EmptySection
          hasStudents={false}
          hasCurriculumAssigned={true}
          element={<div>{TEST_ELEMENT_TEXT}</div>}
        />
      </Router>
    );

    screen.getByAltText('empty desk');
    screen.getByText(i18n.addStudents());
    expect(screen.queryByAltText('blank screen')).toBeNull();
    expect(screen.queryByText(i18n.browseCurriculum())).toBeNull();
    expect(screen.queryByText(TEST_ELEMENT_TEXT)).toBeNull();
  });

  it('Displays element when has students and curriculum', () => {
    render(
      <Router>
        <EmptySection
          hasStudents={true}
          hasCurriculumAssigned={true}
          element={<div>{TEST_ELEMENT_TEXT}</div>}
        />
      </Router>
    );

    expect(screen.queryByText(i18n.emptySectionHeadline())).toBeNull();
    expect(screen.queryByAltText('empty desk')).toBeNull();
    expect(screen.queryByAltText('blank screen')).toBeNull();
    expect(screen.queryByText(i18n.addStudents())).toBeNull();
    expect(screen.queryByText(i18n.browseCurriculum())).toBeNull();
    screen.getByText(TEST_ELEMENT_TEXT);
  });
});
