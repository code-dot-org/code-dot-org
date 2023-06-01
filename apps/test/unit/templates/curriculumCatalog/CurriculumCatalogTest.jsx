import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {assert, expect} from '../../../util/reconfiguredChai';
import {
  setWindowLocation,
  resetWindowLocation,
} from '../../../../src/code-studio/utils';
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
    window.history.replaceState = () => {};
    render(
      <Provider store={store}>
        <CurriculumCatalog {...defaultProps} />
      </Provider>
    );
  });

  afterEach(() => {
    resetWindowLocation();
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
    const numTotalCurriculumCards = screen.getAllByText('Learn more', {
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
    expect(
      screen.getAllByText('Learn more', {
        exact: false,
      }).length
    ).to.equal(gradesKAnd2ShownCurricula.length);
    gradesKAnd2ShownCurricula.forEach(curriculum => {
      expect(screen.getAllByText(curriculum.display_name).length).to.equal(1);
    });
  });

  it('filtering by duration shows any shown course that is one of the selected durations', () => {
    const numTotalCurriculumCards = screen.getAllByText('Learn more', {
      exact: false,
    }).length;
    expect(numTotalCurriculumCards).to.equal(allShownCurricula.length);

    // Select "Week" in grade level filter
    const weekFilterCheckbox = screen.getByDisplayValue('week');
    fireEvent.click(weekFilterCheckbox);
    assert(weekFilterCheckbox.checked);

    // Filters for all week-long courses
    expect(
      screen.getAllByText('Learn more', {
        exact: false,
      }).length
    ).to.equal(weeklongShownCurricula.length);
    weeklongShownCurricula.forEach(curriculum => {
      expect(screen.getAllByText(curriculum.display_name).length).to.equal(1);
    });
  });

  it('filtering by topic shows any course with at least 1 of the selected topics', () => {
    const numTotalCurriculumCards = screen.getAllByText('Learn more', {
      exact: false,
    }).length;
    expect(numTotalCurriculumCards).to.equal(allShownCurricula.length);

    // Select "Physical Computing" in topic filter
    const physicalCompFilterCheckbox =
      screen.getByDisplayValue('physical_computing');
    fireEvent.click(physicalCompFilterCheckbox);
    assert(physicalCompFilterCheckbox.checked);

    // Filters for all courses with the physical_computing topic
    expect(
      screen.getAllByText('Learn more', {
        exact: false,
      }).length
    ).to.equal(physicalCompShownCurricula.length);
    physicalCompShownCurricula.forEach(curriculum => {
      expect(screen.getAllByText(curriculum.display_name).length).to.equal(1);
    });
  });

  it('filtering by Interdisciplinary topic shows any course labeled with school subjects', () => {
    const numTotalCurriculumCards = screen.getAllByText('Learn more', {
      exact: false,
    }).length;
    expect(numTotalCurriculumCards).to.equal(allShownCurricula.length);

    // Select "Interdisciplinary" in topic filter
    const interdisciplinaryFilterCheckbox =
      screen.getByDisplayValue('interdisciplinary');
    fireEvent.click(interdisciplinaryFilterCheckbox);
    assert(interdisciplinaryFilterCheckbox.checked);

    // Filters for all courses with school subjects
    expect(
      screen.getAllByText('Learn more', {
        exact: false,
      }).length
    ).to.equal(nonNullSchoolSubjectShownCurricula.length);
    nonNullSchoolSubjectShownCurricula.forEach(curriculum => {
      expect(screen.getAllByText(curriculum.display_name).length).to.equal(1);
    });
  });

  it('filtering by device compatibility shows any course with at least 1 of the selected devices', () => {
    const numTotalCurriculumCards = screen.getAllByText('Learn more', {
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
    expect(
      screen.getAllByText('Learn more', {
        exact: false,
      }).length
    ).to.equal(tabletAndNoDeviceShownCurricula.length);
    tabletAndNoDeviceShownCurricula.forEach(curriculum => {
      expect(screen.getAllByText(curriculum.display_name).length).to.equal(1);
    });
  });

  it('filtering by each filter shows subset of courses that match the filters', () => {
    const numTotalCurriculumCards = screen.getAllByText('Learn more', {
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
    // - Tablets or No Device
    expect(
      screen.getAllByText('Learn more', {
        exact: false,
      }).length
    ).to.equal(multipleFiltersAppliedShownCurricula.length);
    multipleFiltersAppliedShownCurricula.forEach(curriculum => {
      expect(screen.getAllByText(curriculum.display_name).length).to.equal(1);
    });
  });

  it('applying every filter only filters out courses that have null for one of the filtered properties', () => {
    const numTotalCurriculumCards = screen.getAllByText('Learn more', {
      exact: false,
    }).length;
    expect(numTotalCurriculumCards).to.equal(allShownCurricula.length);

    // Select all checkboxes
    screen.getAllByRole('checkbox').forEach(checkbox => {
      fireEvent.click(checkbox);
      assert(checkbox.checked);
    });

    // With every filter applied
    expect(
      screen.getAllByText('Learn more', {
        exact: false,
      }).length
    ).to.equal(allFiltersAppliedShownCurricula.length);
    allFiltersAppliedShownCurricula.forEach(curriculum => {
      expect(screen.getAllByText(curriculum.display_name).length).to.equal(1);
    });
  });

  it('applying filters that yield no results shows no results message', () => {
    // Does not show the no results message before filtering
    expect(
      screen.queryAllByText('No matching curricula', {
        exact: false,
      }).length
    ).to.equal(0);

    // Select "Kindergarten" and "No Device" in device filter (which should yield no results)
    const kindergartenFilterCheckbox = screen.getByDisplayValue('kindergarten');
    fireEvent.click(kindergartenFilterCheckbox);
    assert(kindergartenFilterCheckbox.checked);
    const noDeviceFilterCheckbox = screen.getByDisplayValue('no_device');
    fireEvent.click(noDeviceFilterCheckbox);
    assert(noDeviceFilterCheckbox.checked);

    // Does not show any Curriculum Catalog Cards
    expect(screen.queryAllByText('Learn more', {exact: false}).length).to.equal(
      0
    );

    // Does show the no results message
    expect(
      screen.queryAllByText('No matching curricula', {
        exact: false,
      }).length
    ).to.equal(1);
  });
});

describe('CurriculumCatalog with url params', () => {
  const defaultProps = {curriculaData: allCurricula, isEnglish: false};
  let store;
  let replaceStateOrig = window.history.replaceState;
  let fakeWindowLocation = {
    search: '',
    pathname: '',
  };
  let replacedLocation;

  beforeEach(() => {
    store = configureStore({reducer: {responsive}});
    store.dispatch(setResponsiveSize(ResponsiveSize.lg));

    setWindowLocation(fakeWindowLocation);
    replacedLocation = undefined;
    window.history.replaceState = (_, __, newLocation) => {
      replacedLocation = newLocation;
    };
  });

  afterEach(() => {
    resetWindowLocation();
    window.history.replaceState = replaceStateOrig;
  });

  function renderWithUrlParams(urlParams) {
    setWindowLocation({search: urlParams});
    render(
      <Provider store={store}>
        <CurriculumCatalog {...defaultProps} />
      </Provider>
    );
  }

  it('no url params applies no filters on load', () => {
    renderWithUrlParams('');

    expect(
      screen.getAllByText('Learn more', {
        exact: false,
      }).length
    ).to.equal(allShownCurricula.length);
    allShownCurricula.forEach(curriculum => {
      expect(screen.getAllByText(curriculum.display_name).length).to.equal(1);
    });
  });

  it('param with invalid filter key does not filter anything on load', () => {
    renderWithUrlParams('?fakeKey=fakeValue');

    expect(
      screen.getAllByText('Learn more', {
        exact: false,
      }).length
    ).to.equal(allShownCurricula.length);
    allShownCurricula.forEach(curriculum => {
      expect(screen.getAllByText(curriculum.display_name).length).to.equal(1);
    });
  });

  it('param with valid filter key but no value does not filter anything on load', () => {
    renderWithUrlParams('?duration=');

    expect(
      screen.getAllByText('Learn more', {
        exact: false,
      }).length
    ).to.equal(allShownCurricula.length);
    allShownCurricula.forEach(curriculum => {
      expect(screen.getAllByText(curriculum.display_name).length).to.equal(1);
    });
  });

  it('param with valid filter key but invalid value does not filter anything on load', () => {
    renderWithUrlParams('?duration=fakeValue');

    expect(
      screen.getAllByText('Learn more', {
        exact: false,
      }).length
    ).to.equal(allShownCurricula.length);
    allShownCurricula.forEach(curriculum => {
      expect(screen.getAllByText(curriculum.display_name).length).to.equal(1);
    });
  });

  it('params with valid filter key and value applies filters on load', () => {
    renderWithUrlParams('?duration=week');

    expect(
      screen.getAllByText('Learn more', {
        exact: false,
      }).length
    ).to.equal(weeklongShownCurricula.length);
    weeklongShownCurricula.forEach(curriculum => {
      expect(screen.getAllByText(curriculum.display_name).length).to.equal(1);
    });
  });

  it('params with some valid filter keys and some valid values applies valid filters on load', () => {
    renderWithUrlParams(
      '?grade=kindergarten&fakeKey=grade_4&grade=fakeValue&grade=grade_2'
    );

    expect(
      screen.getAllByText('Learn more', {
        exact: false,
      }).length
    ).to.equal(gradesKAnd2ShownCurricula.length);
    gradesKAnd2ShownCurricula.forEach(curriculum => {
      expect(screen.getAllByText(curriculum.display_name).length).to.equal(1);
    });
  });

  it('params with different valid filter keys and different valid values are all applied on load', () => {
    renderWithUrlParams(
      '?grade=grade_2&grade=grade_3&topic=interdisciplinary&topic=physical_computing&device=tablet&device=no_device'
    );

    expect(
      screen.getAllByText('Learn more', {
        exact: false,
      }).length
    ).to.equal(multipleFiltersAppliedShownCurricula.length);
    multipleFiltersAppliedShownCurricula.forEach(curriculum => {
      expect(screen.getAllByText(curriculum.display_name).length).to.equal(1);
    });
  });

  it('params update when first filter checkbox is selected', () => {
    renderWithUrlParams('');

    // Select "Week" in grade level filter
    const weekFilterCheckbox = screen.getByDisplayValue('week');
    fireEvent.click(weekFilterCheckbox);
    assert(weekFilterCheckbox.checked);

    assert(replacedLocation.includes('duration=week'));
  });

  it('params update when filter checkbox is selected with others in same filter already selected', () => {
    renderWithUrlParams('?duration=lesson');

    // Select "Week" in grade level filter
    const weekFilterCheckbox = screen.getByDisplayValue('week');
    fireEvent.click(weekFilterCheckbox);
    assert(weekFilterCheckbox.checked);

    assert(replacedLocation.includes('duration=lesson&duration=week'));
  });

  it('params update when filter checkbox is selected with others in different filter already selected', () => {
    renderWithUrlParams('?grade=grade_2&grade=grade_3');

    // Select "Week" in grade level filter
    const weekFilterCheckbox = screen.getByDisplayValue('week');
    fireEvent.click(weekFilterCheckbox);
    assert(weekFilterCheckbox.checked);

    assert(replacedLocation.includes('grade=grade_2&grade=grade_3'));
    assert(replacedLocation.includes('duration=week'));
  });

  it('params update when only checked filter checkbox is deselected', () => {
    renderWithUrlParams('?duration=lesson');

    // Deselect "Lesson" in grade level filter
    const lessonFilterCheckbox = screen.getByDisplayValue('lesson');
    fireEvent.click(lessonFilterCheckbox);
    assert(!lessonFilterCheckbox.checked);

    // When no params are present, replacedLocation is set to undefined
    expect(replacedLocation).to.be.undefined;
  });

  it('params update when one of checked filter checkboxes is deselected', () => {
    renderWithUrlParams('?duration=lesson&duration=week');

    // Deselect "Lesson" in grade level filter
    const lessonFilterCheckbox = screen.getByDisplayValue('lesson');
    fireEvent.click(lessonFilterCheckbox);
    assert(!lessonFilterCheckbox.checked);

    assert(!replacedLocation.includes('lesson'));
    assert(replacedLocation.includes('duration=week'));
  });
});
