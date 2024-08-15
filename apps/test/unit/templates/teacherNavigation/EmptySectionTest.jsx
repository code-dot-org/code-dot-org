import {render, screen} from '@testing-library/react';
import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';

import EmptySection from '@cdo/apps/templates/teacherNavigation/EmptySection';
import i18n from '@cdo/locale';

const TEST_ELEMENT_TEXT = 'Test Element';

describe('EmptySection', () => {
  it('Shows only no students graphic if both should be shown', () => {
    render(
      <Router>
        <EmptySection
          showNoStudents={true}
          showNoCurriculumAssigned={true}
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

  it('Shows no curriculum graphic', () => {
    render(
      <Router>
        <EmptySection
          showNoStudents={false}
          showNoCurriculumAssigned={true}
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

  it('Shows no students', () => {
    render(
      <Router>
        <EmptySection
          showNoStudents={true}
          showNoCurriculumAssigned={false}
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

  it('Shows element and no empty section graphic', () => {
    render(
      <Router>
        <EmptySection
          showNoStudents={false}
          showNoCurriculumAssigned={false}
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
