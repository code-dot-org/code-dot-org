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

  const noImageCurriculum = {
    key: 'course1',
    display_name: 'Course 1',
    grade_levels: 'K,1',
    image: null,
    cs_topic: 'programming',
    school_subject: null,
  };

  const allShownCurricula = [
    makerCurriculum,
    countingCurriculum,
    noImageCurriculum
  ];
  const defaultProps = {curriculaData: allShownCurricula, isEnglish: false};

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
    allShownCurricula
      .map(curriculum => curriculum.display_name)
      .forEach(courseName => screen.getByRole('heading', {name: courseName}));
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
