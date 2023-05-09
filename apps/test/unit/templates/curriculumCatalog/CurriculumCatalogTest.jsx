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
  allShownCurricula,
  gradesKAnd2ShownCurricula,
  weeklongShownCurricula,
  physicalCompShownCurricula,
  nonNullSchoolSubjectShownCurricula,
  tabletAndNoDeviceShownCurricula,
  multipleFiltersAppliedShownCurricula,
  allFiltersAppliedShownCurricula,
  noGradesCurriculum,
  noPathCurriculum,
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

  it('filtering by grade level shows any shown course that supports one of the selected grades', () => {
    const numTotalCurriculumCards = screen.getAllByText('Quick View', {
      exact: false,
    }).length;
    expect(numTotalCurriculumCards).to.equal(allShownCurricula.length);

    // Select "Kindergarten" and "Grade 2" in grade level filter
    const kindergartenFilterCheckbox = screen.getByDisplayValue('kindergarten');
    fireEvent.click(kindergartenFilterCheckbox);
    assert(kindergartenFilterCheckbox.checked);
    const grade2FilterCheckbox = screen.getByDisplayValue('grade_2');
    fireEvent.click(grade2FilterCheckbox);
    assert(grade2FilterCheckbox.checked);

    // Filters for all courses for kindergarten and/or grade 2
    const numFilteredCurriculumCards = screen.getAllByText('Quick View', {
      exact: false,
    }).length;
    expect(numFilteredCurriculumCards).to.equal(
      gradesKAnd2ShownCurricula.length
    );
  });

  it('filtering by duration shows any shown course that is one of the selected durations', () => {
    const numTotalCurriculumCards = screen.getAllByText('Quick View', {
      exact: false,
    }).length;
    expect(numTotalCurriculumCards).to.equal(allShownCurricula.length);

    // Select "Week" in grade level filter
    const weekFilterCheckbox = screen.getByDisplayValue('week');
    fireEvent.click(weekFilterCheckbox);
    assert(weekFilterCheckbox.checked);

    // Filters for all week-long courses
    const numFilteredCurriculumCards = screen.getAllByText('Quick View', {
      exact: false,
    }).length;
    expect(numFilteredCurriculumCards).to.equal(weeklongShownCurricula.length);
  });

  it('filtering by topic shows any course with at least 1 of the selected topics', () => {
    const numTotalCurriculumCards = screen.getAllByText('Quick View', {
      exact: false,
    }).length;
    expect(numTotalCurriculumCards).to.equal(allShownCurricula.length);

    // Select "Physical Computing" in topic filter
    const physicalCompFilterCheckbox =
      screen.getByDisplayValue('physical_computing');
    fireEvent.click(physicalCompFilterCheckbox);
    assert(physicalCompFilterCheckbox.checked);

    // Filters for all courses with the physical_computing topic
    const numFilteredCurriculumCards = screen.getAllByText('Quick View', {
      exact: false,
    }).length;
    expect(numFilteredCurriculumCards).to.equal(
      physicalCompShownCurricula.length
    );
  });

  it('filtering by Interdisciplinary topic shows any course labeled with school subjects', () => {
    const numTotalCurriculumCards = screen.getAllByText('Quick View', {
      exact: false,
    }).length;
    expect(numTotalCurriculumCards).to.equal(allShownCurricula.length);

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
      nonNullSchoolSubjectShownCurricula.length
    );
  });

  it('filtering by device compatibility shows any course with at least 1 of the selected devices', () => {
    const numTotalCurriculumCards = screen.getAllByText('Quick View', {
      exact: false,
    }).length;
    expect(numTotalCurriculumCards).to.equal(allShownCurricula.length);

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
      tabletAndNoDeviceShownCurricula.length
    );
  });

  it('filtering by each filter shows subset of courses that match the filters', () => {
    const numTotalCurriculumCards = screen.getAllByText('Quick View', {
      exact: false,
    }).length;
    expect(numTotalCurriculumCards).to.equal(allShownCurricula.length);

    // Select "Grade 2" and "Grade 3" in grade level filter
    const grade2FilterCheckbox = screen.getByDisplayValue('grade_2');
    fireEvent.click(grade2FilterCheckbox);
    assert(grade2FilterCheckbox.checked);
    const grade3FilterCheckbox = screen.getByDisplayValue('grade_3');
    fireEvent.click(grade3FilterCheckbox);
    assert(grade3FilterCheckbox.checked);

    // Select "Physical Computing" and "Interdisciplinary" in topic filter
    const physicalCompFilterCheckbox =
      screen.getByDisplayValue('physical_computing');
    fireEvent.click(physicalCompFilterCheckbox);
    assert(physicalCompFilterCheckbox.checked);
    const interdisciplinaryFilterCheckbox =
      screen.getByDisplayValue('interdisciplinary');
    fireEvent.click(interdisciplinaryFilterCheckbox);
    assert(interdisciplinaryFilterCheckbox.checked);

    // Select "Tablet" and "No Device" in device filter
    const tabletFilterCheckbox = screen.getByDisplayValue('tablet');
    fireEvent.click(tabletFilterCheckbox);
    assert(tabletFilterCheckbox.checked);
    const noDeviceFilterCheckbox = screen.getByDisplayValue('no_device');
    fireEvent.click(noDeviceFilterCheckbox);
    assert(noDeviceFilterCheckbox.checked);

    // Filters for all courses that support:
    // - Grades 2 or 3
    // - Physical Computing or Interdisciplinary topics
    // - Chromebooks or tablets
    const numFilteredCurriculumCards = screen.getAllByText('Quick View', {
      exact: false,
    }).length;
    expect(numFilteredCurriculumCards).to.equal(
      multipleFiltersAppliedShownCurricula.length
    );
  });

  it('applying every filter only filters out courses that have null for one of the filtered properties', () => {
    const numTotalCurriculumCards = screen.getAllByText('Quick View', {
      exact: false,
    }).length;
    expect(numTotalCurriculumCards).to.equal(allShownCurricula.length);

    // Select all checkboxes
    screen.getAllByRole('checkbox').forEach(checkbox => {
      fireEvent.click(checkbox);
      assert(checkbox.checked);
    });

    // With every filter applied
    const numFilteredCurriculumCards = screen.getAllByText('Quick View', {
      exact: false,
    }).length;
    expect(numFilteredCurriculumCards).to.equal(
      allFiltersAppliedShownCurricula.length
    );
  });
});
