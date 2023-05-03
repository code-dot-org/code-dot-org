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
import {
  allCurricula,
  grades2And3Curricula,
  physicalCompCurricula,
  nonNullSchoolSubjectCurricula,
  tabletAndNoDeviceCurricula,
} from './CurriculumCatalogTestHelper';

describe('CurriculumCatalog', () => {
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
    const numTotalCurriculumCards = screen.getAllByText('Quick View', {
      exact: false,
    }).length;
    expect(numTotalCurriculumCards).to.equal(allCurricula.length);

    // Select "Grade 2" and "Grade 3" in grade level filter
    const grade2FilterCheckbox = screen.getByDisplayValue('grade_2');
    fireEvent.click(grade2FilterCheckbox);
    assert(grade2FilterCheckbox.checked);
    const grade3FilterCheckbox = screen.getByDisplayValue('grade_3');
    fireEvent.click(grade3FilterCheckbox);
    assert(grade3FilterCheckbox.checked);

    // Filters for all courses for grades 2 and/or 3
    const numFilteredCurriculumCards = screen.getAllByText('Quick View', {
      exact: false,
    }).length;
    expect(numFilteredCurriculumCards).to.equal(grades2And3Curricula.length);
  });

  it('filtering by topic shows any course with at least 1 of the selected topics', () => {
    const numTotalCurriculumCards = screen.getAllByText('Quick View', {
      exact: false,
    }).length;
    expect(numTotalCurriculumCards).to.equal(allCurricula.length);

    // Select "Physical Computing" in topic filter
    const physicalCompFilterCheckbox =
      screen.getByDisplayValue('physical_computing');
    fireEvent.click(physicalCompFilterCheckbox);
    assert(physicalCompFilterCheckbox.checked);

    // Filters for all courses with the physical_computing topic
    const numFilteredCurriculumCards = screen.getAllByText('Quick View', {
      exact: false,
    }).length;
    expect(numFilteredCurriculumCards).to.equal(physicalCompCurricula.length);
  });

  it('filtering by Interdisciplinary topic shows any course labeled with school subjects', () => {
    const numTotalCurriculumCards = screen.getAllByText('Quick View', {
      exact: false,
    }).length;
    expect(numTotalCurriculumCards).to.equal(allCurricula.length);

    // Select "Interdisciplinary" in topic filter
    const interdisciplinaryFilterCheckbox =
      screen.getByDisplayValue('interdisciplinary');
    fireEvent.click(interdisciplinaryFilterCheckbox);
    assert(interdisciplinaryFilterCheckbox.checked);

    // Filters for all courses with school subjects
    const numFilteredCurriculumCards = screen.getAllByText('Quick View', {
      exact: false,
    }).length;
    expect(numFilteredCurriculumCards).to.equal(
      nonNullSchoolSubjectCurricula.length
    );
  });

  it('filtering by device compatibility shows any course with at least 1 of the selected devices', () => {
    const numTotalCurriculumCards = screen.getAllByText('Quick View', {
      exact: false,
    }).length;
    expect(numTotalCurriculumCards).to.equal(allCurricula.length);

    // Select "Tablet" and "No Device" in device filter
    const tabletFilterCheckbox = screen.getByDisplayValue('tablet');
    fireEvent.click(tabletFilterCheckbox);
    assert(tabletFilterCheckbox.checked);
    const noDeviceFilterCheckbox = screen.getByDisplayValue('no_device');
    fireEvent.click(noDeviceFilterCheckbox);
    assert(noDeviceFilterCheckbox.checked);

    // Filters for all courses compatible with chromebooks and tablets
    const numFilteredCurriculumCards = screen.getAllByText('Quick View', {
      exact: false,
    }).length;
    expect(numFilteredCurriculumCards).to.equal(
      tabletAndNoDeviceCurricula.length
    );
  });
});
