import React from 'react';
import {render, screen} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {expect} from '../../../util/reconfiguredChai';
import responsive, {
  setResponsiveSize,
  ResponsiveSize,
} from '@cdo/apps/code-studio/responsiveRedux';
import CurriculumCatalog from '@cdo/apps/templates/curriculumCatalog/CurriculumCatalog';

describe('CurriculumCatalog', () => {
  const makerCurriculum = {
    key: 'devices',
    display_name: 'Creating Apps for Devices',
    grade_levels: '6,7,8,9,10,11,12',
    image: 'devices.png',
    duration: 'week',
    cs_topic: 'art_and_design,app_design,physical_computing,programming',
    school_subject: null,
    course_version_path: '/s/course',
  };

  const countingCurriculum = {
    key: 'counting-csc',
    display_name: 'Computer Science Connections',
    grade_levels: '3,4,5',
    image: 'csc.png',
    duration: 'lesson',
    cs_topic: 'programming',
    school_subject: 'math',
    course_version_path: '/s/course',
  };

  const noImageCurriculum = {
    key: 'course1',
    display_name: 'Course 1',
    grade_levels: 'K,1',
    image: null,
    duration: 'lesson',
    cs_topic: 'programming',
    school_subject: null,
    course_version_path: '/s/course',
  };

  const noGradesCurriculum = {
    key: 'no-grades',
    display_name: 'No Grades',
    grade_levels: null,
    image: 'grades.png',
    duration: 'lesson',
    cs_topic: 'programming',
    school_subject: 'math',
    course_version_path: '/s/course',
  };

  const noPathCurriculum = {
    key: 'no-path',
    display_name: 'No Path',
    grade_levels: 'K,1',
    image: 'grades.png',
    duration: 'month',
    cs_topic: 'programming',
    school_subject: 'math',
    course_version_path: null,
  };

  const allShownCurricula = [
    makerCurriculum,
    countingCurriculum,
    noImageCurriculum,
  ];
  const allCurricula = [
    ...allShownCurricula,
    noGradesCurriculum,
    noPathCurriculum,
  ];

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

  it('renders name of each curriculum with grade levels and path', () => {
    allShownCurricula
      .map(curriculum => curriculum.display_name)
      .forEach(courseName => screen.getByRole('heading', {name: courseName}));
  });

  it('does not render any curriculum without grade levels and path', () => {
    expect(screen.queryByText(noGradesCurriculum.display_name)).to.be.null;
    expect(screen.queryByText(noPathCurriculum.display_name)).to.be.null;
  });

  it('all curricula show an image, including curricula without a specific image', () => {
    const images = screen.getAllByRole('img');
    const imagesStr = images.map(image => image.outerHTML).toString();

    allShownCurricula.forEach(curriculum => {
      if (curriculum.image && curriculum.image !== null) {
        expect(imagesStr).to.match(new RegExp(`src="${curriculum.image}"`));
      } else {
        expect(imagesStr).to.match(
          new RegExp(`src="https:\\/\\/images\\.code\\.org\\/\\S*.png"`)
        );
      }
    });
  });
});
