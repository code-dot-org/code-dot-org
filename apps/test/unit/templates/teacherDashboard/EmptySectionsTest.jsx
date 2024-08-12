import {render, screen} from '@testing-library/react';
import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';

import EmptySection from '@cdo/apps/templates/teacherDashboard/EmptySection';
import i18n from '@cdo/locale';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('EmptySection', () => {
  it('displays empty desk image and Add Students link when there are no students', () => {
    render(
      <Router>
        <EmptySection hasStudents={false} hasCurriculumAssigned={false} />
      </Router>
    );

    expect(screen.getByAltText('empty desk')).to.be.visible;
    expect(screen.getByText(i18n.addStudents())).to.be.visible;
    expect(screen.queryByAltText('blank screen')).not.be.visible;
    expect(screen.queryByText(i18n.browseCurriculum())).not.be.visible;
  });

  it('displays blank screen image and Browse Curriculum button when there are students but no curriculum assigned', () => {
    render(
      <Router>
        <EmptySection hasStudents={true} hasCurriculumAssigned={false} />
      </Router>
    );

    expect(screen.getByAltText('blank screen')).to.be.visible;
    expect(screen.getByText(i18n.browseCurriculum())).to.be.visible;
    expect(screen.queryByAltText('empty desk')).not.be.visible;
    expect(screen.queryByText(i18n.addStudents())).not.be.visible;
  });

  it('displays empty desk image and Add Students button when there are no students but there is a curriculum assigned', () => {
    render(
      <Router>
        <EmptySection hasStudents={false} hasCurriculumAssigned={true} />
      </Router>
    );

    expect(screen.getByAltText('empty desk')).to.be.visible;
    expect(screen.getByText(i18n.addStudents())).to.be.visible;
    expect(screen.queryByAltText('blank screen')).not.be.visible;
    expect(screen.queryByText(i18n.browseCurriculum())).not.be.visible;
  });

  it('Is null when there are students and a curriculum is assigned', () => {
    render(
      <Router>
        <EmptySection hasStudents={true} hasCurriculumAssigned={true} />
      </Router>
    );

    expect(screen.queryByText(i18n.emptySectionHeadline())).to.be.null;
  });
});
