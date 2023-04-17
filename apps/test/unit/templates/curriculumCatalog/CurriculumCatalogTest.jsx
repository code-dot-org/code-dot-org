import React from 'react';
import {render, screen} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import responsive, {
  setResponsiveSize,
  ResponsiveSize
} from '@cdo/apps/code-studio/responsiveRedux';
import CurriculumCatalog from '@cdo/apps/templates/curriculumCatalog/CurriculumCatalog';

describe('CurriculumCatalog', () => {
  const makerCurriculum = {
    key: 'devices',
    display_name: 'Creating Apps for Devices',
    grade_levels: '6,7,8,9,10,11,12',
    image: 'https://images.code.org/name.png',
    cs_topic: 'art_and_design,app_design,physical_computing,programming',
    school_subject: null
  };

  const countingCurriculum = {
    key: 'counting-csc',
    display_name: 'Computer Science Discoveries',
    grade_levels: '3,4,5',
    image: 'https://images.code.org/name.png',
    cs_topic: 'programming',
    school_subject: 'math'
  };

  const course1Curriculum = {
    key: 'course1',
    display_name: 'Course 1',
    grade_levels: 'K,1',
    image: 'https://images.code.org/name.png',
    cs_topic: 'programming',
    school_subject: null
  };

  const allCurricula = [makerCurriculum, countingCurriculum, course1Curriculum];
  const defaultProps = {curriculaData: allCurricula, isEnglish: false};

  beforeEach(() => {
    const store = configureStore({reducer: {responsive}});
    store.dispatch(setResponsiveSize(ResponsiveSize.lg));
    render(
      <Provider store={store}>
        <CurriculumCatalog {...defaultProps} />
      </Provider>
    );
  });

  it('renders page title', () => {
    screen.getByRole('heading', {name: 'Curriculum Catalog'});
  });

  it('renders page subtitle', () => {
    screen.getByText('Code.org courses, tutorials, and more', {exact: false});
  });

  it('renders name of each curriculum', () => {
    allCurricula
      .map(curriculum => curriculum.display_name)
      .forEach(courseName => screen.getByRole('heading', {name: courseName}));
  });
});
