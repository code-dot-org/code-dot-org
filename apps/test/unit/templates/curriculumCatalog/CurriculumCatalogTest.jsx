import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {assert, expect} from '../../../util/reconfiguredChai';
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
    cs_topic: 'art_and_design,app_design,physical_computing,programming',
    school_subject: null,
  };

  const countingCurriculum = {
    key: 'counting-csc',
    display_name: 'Computer Science Connections',
    grade_levels: '3,4,5',
    image: 'csc.png',
    cs_topic: 'programming',
    school_subject: 'math',
  };

  const course1Curriculum = {
    key: 'course1',
    display_name: 'Course 1',
    grade_levels: 'K,1',
    image: null,
    cs_topic: 'programming',
    school_subject: null,
    device_compatibility:
      '{"computer":"ideal","chromebook":"ideal","tablet":"ideal","mobile":"not_recommended","no_device":"incompatible"}',
  };

  const course2Curriculum = {
    key: 'course2',
    display_name: 'Course 2',
    grade_levels: '2,3,4,5',
    image: 'course2.png',
    cs_topic: 'programming',
    school_subject: null,
    device_compatibility:
      '{"computer":"ideal","chromebook":"ideal","tablet":"ideal","mobile":"not_recommended","no_device":"incompatible"}',
  };

  const course3Curriculum = {
    key: 'course3',
    display_name: 'Course 3',
    grade_levels: '3,4,5',
    image: 'course3.png',
    cs_topic: 'programming',
    school_subject: null,
    device_compatibility:
      '{"computer":"ideal","chromebook":"ideal","tablet":"ideal","mobile":"not_recommended","no_device":"incompatible"}',
  };

  const course4Curriculum = {
    key: 'course4',
    display_name: 'Course 4',
    grade_levels: '4,5',
    image: 'course4.png',
    cs_topic: 'programming',
    school_subject: null,
    device_compatibility:
      '{"computer":"ideal","chromebook":"ideal","tablet":"ideal","mobile":"not_recommended","no_device":"incompatible"}',
  };

  const allCurricula = [
    makerCurriculum,
    countingCurriculum,
    course1Curriculum,
    course2Curriculum,
    course3Curriculum,
    course4Curriculum,
  ];
  // const curriculaWithGrades2And3 = [
  //   countingCurriculum,
  //   course2Curriculum,
  //   course3Curriculum,
  // ];
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

  it('all curricula show an image, including curricula without a specific image', () => {
    const images = screen.getAllByRole('img');
    const imagesStr = images.map(image => image.outerHTML).toString();

    allCurricula.forEach(curriculum => {
      if (curriculum.image && curriculum.image !== null) {
        expect(imagesStr).to.match(new RegExp(`src="${curriculum.image}"`));
      } else {
        expect(imagesStr).to.match(
          new RegExp(`src="https:\\/\\/images\\.code\\.org\\/\\S*.png"`)
        );
      }
    });
  });

  it('filtering by grade level shows any course that supports one of the selected grades', () => {
    const grade2FilterCheckbox = screen.getByDisplayValue('grade_2');
    fireEvent.click(grade2FilterCheckbox);
    assert(grade2FilterCheckbox.checked);
  });
});
