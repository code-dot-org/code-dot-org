import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import responsive, {
  setResponsiveSize,
  ResponsiveSize,
} from '@cdo/apps/code-studio/responsiveRedux';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import CurriculumCatalog from '@cdo/apps/templates/curriculumCatalog/CurriculumCatalog';
import teacherSections, {
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {
  getSimilarRecommendations,
  getStretchRecommendations,
} from '@cdo/apps/util/curriculumRecommender/curriculumRecommender';
import {tryGetSessionStorage} from '@cdo/apps/utils';

import {
  setWindowLocation,
  resetWindowLocation,
} from '../../../../src/code-studio/utils';
import {assert, expect} from '../../../util/reconfiguredChai';
import {FULL_TEST_COURSES} from '../../util/curriculumRecommenderTestCurricula';
import {sections} from '../studioHomepages/fakeSectionUtils';

import {
  allCurricula,
  allShownCurricula,
  gradesKAnd2ShownCurricula,
  weeklongShownCurricula,
  physicalCompShownCurricula,
  nonNullSchoolSubjectShownCurricula,
  tabletAndNoDeviceShownCurricula,
  csdAndHocShownCurricula,
  translatedCurricula,
  multipleFiltersAppliedShownCurricula,
  allFiltersAppliedShownCurricula,
  noGradesCurriculum,
  noPathCurriculum,
} from './CurriculumCatalogTestHelper';

describe('CurriculumCatalog', () => {
  const defaultProps = {
    curriculaData: allCurricula,
    isEnglish: false,
    languageNativeName: 'sampleLanguageNativeName',
    isSignedOut: true,
    isInUS: true,
    isTeacher: false,
    curriculaTaught: null,
  };
  let store;

  let replacedLocation;
  let replaceStateOrig = window.history.replaceState;

  beforeEach(() => {
    stubRedux();
    registerReducers({responsive, teacherSections});
    store = getStore();
    store.dispatch(setResponsiveSize(ResponsiveSize.lg));
    store.dispatch(setSections(sections));

    replacedLocation = undefined;
    window.history.replaceState = (_, __, newLocation) => {
      replacedLocation = newLocation;
    };
  });

  afterEach(() => {
    restoreRedux();
    resetWindowLocation();
    sessionStorage.removeItem('similarRecommenderResults');
    sessionStorage.removeItem('stretchRecommenderResults');
    window.history.replaceState = replaceStateOrig;
  });

  function renderDefault() {
    render(
      <Provider store={store}>
        <CurriculumCatalog {...defaultProps} />
      </Provider>
    );
  }

  it('renders page title', () => {
    renderDefault();

    screen.getByRole('heading', {name: 'Curriculum Catalog'});
  });

  it('renders page subtitle', () => {
    renderDefault();

    screen.getByText('Code.org courses, tutorials, and more', {exact: false});
  });

  it('does not render language filter row when in English locale', () => {
    const props = {...defaultProps, isEnglish: true};
    render(
      <Provider store={store}>
        <CurriculumCatalog {...props} />
      </Provider>
    );

    expect(screen.queryByText('sampleLanguageNativeName')).to.be.null;
  });

  it('renders language filter row when not in English locale', () => {
    renderDefault();

    expect(
      screen.getAllByText('sampleLanguageNativeName', {exact: false}).length
    ).to.equal(2);
  });

  it('renders name of each curriculum with grade levels and path', () => {
    renderDefault();

    allShownCurricula
      .map(curriculum => curriculum.display_name)
      .forEach(courseName => screen.getByRole('heading', {name: courseName}));
  });

  it('does not render any curriculum without grade levels and path', () => {
    renderDefault();

    expect(screen.queryByText(noGradesCurriculum.display_name)).to.be.null;
    expect(screen.queryByText(noPathCurriculum.display_name)).to.be.null;
  });

  it('all curricula show an image, including curricula without a specific image', () => {
    renderDefault();

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

  it('curriculum cards show Assign button for signed-out users', () => {
    const props = {...defaultProps, isSignedOut: true};
    render(
      <Provider store={store}>
        <CurriculumCatalog {...props} />
      </Provider>
    );

    const numCardsWithAssign = screen.getAllByText('Assign', {
      exact: false,
    }).length;
    expect(numCardsWithAssign).to.equal(allShownCurricula.length);
    expect(screen.queryByText('Try Now')).to.be.null;
  });

  it('curriculum cards show Assign button for teachers', () => {
    const props = {...defaultProps, isSignedOut: false, isTeacher: true};
    render(
      <Provider store={store}>
        <CurriculumCatalog {...props} />
      </Provider>
    );

    const numCardsWithAssign = screen.getAllByText('Assign', {
      exact: false,
    }).length;
    expect(numCardsWithAssign).to.equal(allShownCurricula.length);
    expect(screen.queryByText('Try Now')).to.be.null;
  });

  it('curriculum cards show Try Now button for students', () => {
    const props = {...defaultProps, isSignedOut: false, isTeacher: false};
    render(
      <Provider store={store}>
        <CurriculumCatalog {...props} />
      </Provider>
    );

    const numCardsWithTryNow = screen.getAllByText('Try Now', {
      exact: false,
    }).length;
    expect(numCardsWithTryNow).to.equal(allShownCurricula.length);
    expect(screen.queryByText('Assign')).to.be.null;
  });

  it('filtering by grade level shows any shown course that supports one of the selected grades', () => {
    renderDefault();

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
    expect(
      screen.getAllByText('Quick View', {
        exact: false,
      }).length
    ).to.equal(gradesKAnd2ShownCurricula.length);
    gradesKAnd2ShownCurricula.forEach(curriculum => {
      expect(screen.getAllByText(curriculum.display_name).length).to.equal(1);
    });
  });

  it('filtering by duration shows any shown course that is one of the selected durations', () => {
    renderDefault();

    const numTotalCurriculumCards = screen.getAllByText('Quick View', {
      exact: false,
    }).length;
    expect(numTotalCurriculumCards).to.equal(allShownCurricula.length);

    // Select "Week" in grade level filter
    const weekFilterCheckbox = screen.getByDisplayValue('week');
    fireEvent.click(weekFilterCheckbox);
    assert(weekFilterCheckbox.checked);

    // Filters for all week-long courses
    expect(
      screen.getAllByText('Quick View', {
        exact: false,
      }).length
    ).to.equal(weeklongShownCurricula.length);
    weeklongShownCurricula.forEach(curriculum => {
      expect(screen.getAllByText(curriculum.display_name).length).to.equal(1);
    });
  });

  it('filtering by topic shows any course with at least 1 of the selected topics', () => {
    renderDefault();

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
    expect(
      screen.getAllByText('Quick View', {
        exact: false,
      }).length
    ).to.equal(physicalCompShownCurricula.length);
    physicalCompShownCurricula.forEach(curriculum => {
      expect(screen.getAllByText(curriculum.display_name).length).to.equal(1);
    });
  });

  it('filtering by Interdisciplinary topic shows any course labeled with school subjects', () => {
    renderDefault();

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
    expect(
      screen.getAllByText('Quick View', {
        exact: false,
      }).length
    ).to.equal(nonNullSchoolSubjectShownCurricula.length);
    nonNullSchoolSubjectShownCurricula.forEach(curriculum => {
      expect(screen.getAllByText(curriculum.display_name).length).to.equal(1);
    });
  });

  it('filtering by device compatibility shows any course with at least 1 of the selected devices', () => {
    renderDefault();

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
    expect(
      screen.getAllByText('Quick View', {
        exact: false,
      }).length
    ).to.equal(tabletAndNoDeviceShownCurricula.length);
    tabletAndNoDeviceShownCurricula.forEach(curriculum => {
      expect(screen.getAllByText(curriculum.display_name).length).to.equal(1);
    });
  });

  it('filtering by marketing initiative shows any course with at least 1 of the selected initiatives', () => {
    renderDefault();

    const numTotalCurriculumCards = screen.getAllByText('Quick View', {
      exact: false,
    }).length;
    expect(numTotalCurriculumCards).to.equal(allShownCurricula.length);

    // Select "CSD" and "HOC" in marketing initiative filter
    const csdFilterCheckbox = screen.getByDisplayValue('csd');
    fireEvent.click(csdFilterCheckbox);
    assert(csdFilterCheckbox.checked);
    const hocFilterCheckbox = screen.getByDisplayValue('hoc');
    fireEvent.click(hocFilterCheckbox);
    assert(hocFilterCheckbox.checked);

    // Filters for all courses from CSD and HOC.
    expect(
      screen.getAllByText('Quick View', {
        exact: false,
      }).length
    ).to.equal(csdAndHocShownCurricula.length);
    csdAndHocShownCurricula.forEach(curriculum => {
      expect(screen.getAllByText(curriculum.display_name).length).to.equal(1);
    });
  });

  it('filtering by translated shows any course translated in the users locale', () => {
    renderDefault();

    const numTotalCurriculumCards = screen.getAllByText('Quick View', {
      exact: false,
    }).length;
    expect(numTotalCurriculumCards).to.equal(allShownCurricula.length);

    // Toggle translated filter
    const translatedToggle = screen.getByLabelText(
      'Only show curricula available in sampleLanguageNativeName'
    );
    fireEvent.click(translatedToggle);
    assert(translatedToggle.checked);

    // Filters for all courses translated in the users locale
    expect(
      screen.getAllByText('Quick View', {
        exact: false,
      }).length
    ).to.equal(translatedCurricula.length);
    translatedCurricula.forEach(curriculum => {
      expect(screen.getAllByText(curriculum.display_name).length).to.equal(1);
    });
  });

  it('filtering by each filter shows subset of courses that match the filters', () => {
    renderDefault();

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
    // - Tablets or No Device
    expect(
      screen.getAllByText('Quick View', {
        exact: false,
      }).length
    ).to.equal(multipleFiltersAppliedShownCurricula.length);
    multipleFiltersAppliedShownCurricula.forEach(curriculum => {
      expect(screen.getAllByText(curriculum.display_name).length).to.equal(1);
    });
  });

  it('applying every curricula filter only filters out courses that have null for one of the filtered properties', () => {
    renderDefault();

    const numTotalCurriculumCards = screen.getAllByText('Quick View', {
      exact: false,
    }).length;
    expect(numTotalCurriculumCards).to.equal(allShownCurricula.length);

    // Select all curricula checkboxes
    screen.getAllByRole('checkbox').forEach(checkbox => {
      // Ignore filter for translation checkbox
      if (checkbox.name !== 'filterTranslatedToggle') {
        fireEvent.click(checkbox);
        assert(checkbox.checked);
      }
    });

    // With every filter applied
    expect(
      screen.getAllByText('Quick View', {
        exact: false,
      }).length
    ).to.equal(allFiltersAppliedShownCurricula.length);
    allFiltersAppliedShownCurricula.forEach(curriculum => {
      expect(screen.getAllByText(curriculum.display_name).length).to.equal(1);
    });
  });

  it('applying filters that yield no results shows no results message', () => {
    renderDefault();

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
    expect(screen.queryAllByText('Quick View', {exact: false}).length).to.equal(
      0
    );

    // Does show the no results message
    expect(
      screen.queryAllByText('No matching curricula', {
        exact: false,
      }).length
    ).to.equal(1);
  });

  describe('with url params', () => {
    function renderWithUrlParams(urlParams) {
      setWindowLocation({search: urlParams});
      renderDefault();
    }

    it('no url params applies no filters on load', () => {
      renderWithUrlParams('');

      expect(
        screen.getAllByText('Quick View', {
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
        screen.getAllByText('Quick View', {
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
        screen.getAllByText('Quick View', {
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
        screen.getAllByText('Quick View', {
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
        screen.getAllByText('Quick View', {
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
        screen.getAllByText('Quick View', {
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
        screen.getAllByText('Quick View', {
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

    it('params update when translated toggle is flipped', () => {
      renderWithUrlParams('');
      const translatedToggle = screen.getByLabelText(
        'Only show curricula available in sampleLanguageNativeName'
      );

      // Toggle "translated" on
      fireEvent.click(translatedToggle);
      assert(translatedToggle.checked);
      assert(replacedLocation.includes('translated=true'));

      // Toggle "translated" off
      fireEvent.click(translatedToggle);
      assert(!translatedToggle.checked);
      assert(replacedLocation.includes('translated=false'));
    });
  });

  describe('with recommender test curricula', () => {
    it('renders image and link of similar and stretch recommended curricula', () => {
      const props = {...defaultProps, curriculaData: FULL_TEST_COURSES};
      render(
        <Provider store={store}>
          <CurriculumCatalog {...props} />
        </Provider>
      );
      const quickViewButtons = screen.getAllByText('Quick View', {
        exact: false,
      });

      // Track the number of times the Similar and Stretch recommenders output the same top result
      let numOverlapTopResults = 0;

      for (let i = 0; i < FULL_TEST_COURSES.length; i++) {
        const currCurriculum = FULL_TEST_COURSES[i];

        // Get the Similar Recommended Curriculum for the current test curriculum
        const recommendedSimilarCurriculum = getSimilarRecommendations(
          FULL_TEST_COURSES,
          currCurriculum.key,
          null
        )[0];

        // Get the Stretch Recommended Curriculum for the current test curriculum. If the top stretch curriculum result is the same
        // as the similar curriculum, then get the second stretch curriculum to match the logic in CurriculumCatalog.jsx.
        const recommendedStretchCurriculumResults = getStretchRecommendations(
          FULL_TEST_COURSES,
          currCurriculum.key,
          null
        );
        let recommendedStretchCurriculum =
          recommendedStretchCurriculumResults[0];
        if (
          recommendedSimilarCurriculum.key ===
          recommendedStretchCurriculumResults[0].key
        ) {
          numOverlapTopResults++;
          recommendedStretchCurriculum = recommendedStretchCurriculumResults[1];
        }

        // Open expanded card of the current test curriculum
        fireEvent.click(quickViewButtons[i]);
        screen.getByText(currCurriculum.description);

        // Check that the recommended similar curriculum's image and link are present on the current test curriculum's expanded card.
        // Image's alt text is the curriculum's display name.
        screen.getByAltText(recommendedSimilarCurriculum.display_name);
        assert(
          document
            .querySelector('#similarCurriculumButton')
            .innerHTML.includes(recommendedSimilarCurriculum.display_name)
        );

        // Check that the recommended stretch curriculum's image and link are present on the current test curriculum's expanded card.
        // Image's alt text is the curriculum's display name.
        screen.getByAltText(recommendedStretchCurriculum.display_name);
        assert(
          document
            .querySelector('#stretchCurriculumButton')
            .innerHTML.includes(recommendedStretchCurriculum.display_name)
        );
      }

      // Ensure that there were instances of the Similar and Stretch recommenders outputting the same result, meaning the Stretch
      // recommender had to suggest its next top result.
      assert(numOverlapTopResults === 1);
    });

    it('does not recommend similar or stretch curricula the user has already taught', () => {
      // fullTestCourse3 is the top-ranked similar or stretch curriculum for several curricula
      const curriculaTaughtBefore = [FULL_TEST_COURSES[2].course_offering_id];
      const props = {
        ...defaultProps,
        curriculaData: FULL_TEST_COURSES,
        curriculaTaught: curriculaTaughtBefore,
      };
      render(
        <Provider store={store}>
          <CurriculumCatalog {...props} />
        </Provider>
      );
      const quickViewButtons = screen.getAllByText('Quick View', {
        exact: false,
      });

      for (let i = 0; i < FULL_TEST_COURSES.length; i++) {
        const currCurriculum = FULL_TEST_COURSES[i];

        // Get the Similar Recommended Curriculum for the current test curriculum
        const recommendedSimilarCurriculum = getSimilarRecommendations(
          FULL_TEST_COURSES,
          currCurriculum.key,
          curriculaTaughtBefore
        )[0];

        // Get the Stretch Recommended Curriculum for the current test curriculum. If the top stretch curriculum result is the same as
        // the Similar Recommended Curriculum, then get the second stretch curriculum to match the logic in CurriculumCatalog.jsx.
        const stretchCurriculumRecommendations = getStretchRecommendations(
          FULL_TEST_COURSES,
          currCurriculum.key,
          curriculaTaughtBefore
        );
        const recommendedStretchCurriculum =
          recommendedSimilarCurriculum.key ===
          stretchCurriculumRecommendations[0].key
            ? stretchCurriculumRecommendations[1]
            : stretchCurriculumRecommendations[0];

        // Open expanded card of the current test curriculum
        fireEvent.click(quickViewButtons[i]);
        screen.getByText(currCurriculum.description);

        // Ensure none of the recommendations are ones the user has taught before
        assert(
          !curriculaTaughtBefore.includes(recommendedSimilarCurriculum.key) &&
            !curriculaTaughtBefore.includes(recommendedStretchCurriculum.key)
        );

        // Image's alt text is the curriculum's display name.
        screen.getByAltText(recommendedSimilarCurriculum.display_name);
        assert(
          document
            .querySelector('#similarCurriculumButton')
            .innerHTML.includes(recommendedSimilarCurriculum.display_name)
        );

        screen.getByAltText(recommendedStretchCurriculum.display_name);
        assert(
          document
            .querySelector('#stretchCurriculumButton')
            .innerHTML.includes(recommendedStretchCurriculum.display_name)
        );
      }
    });

    it('sets sessionStorage for Similar Curriculum Recommender result', () => {
      const props = {...defaultProps, curriculaData: FULL_TEST_COURSES};
      render(
        <Provider store={store}>
          <CurriculumCatalog {...props} />
        </Provider>
      );
      const firstQuickViewButton = screen.getAllByText('Quick View', {
        exact: false,
      })[0];

      // Get the Similar Recommended Curriculum for the first test curriculum
      const firstTestCurriculum = FULL_TEST_COURSES[0];
      const similarCurriculumRecommendations = getSimilarRecommendations(
        FULL_TEST_COURSES,
        firstTestCurriculum.key,
        null
      );

      // Open expanded card of the first test curriculum
      fireEvent.click(firstQuickViewButton);
      screen.getByText(firstTestCurriculum.description);

      // Check that sessionStorage has result of Similar Curriculum Recommender
      const storedRecommenderResults = JSON.parse(
        tryGetSessionStorage('similarRecommenderResults', '{}')
      );
      expect(storedRecommenderResults[firstTestCurriculum.key].key).to.equal(
        similarCurriculumRecommendations[0].key
      );
    });

    it('sets sessionStorage for Stretch Curriculum Recommender result', () => {
      const props = {...defaultProps, curriculaData: FULL_TEST_COURSES};
      render(
        <Provider store={store}>
          <CurriculumCatalog {...props} />
        </Provider>
      );
      const firstQuickViewButton = screen.getAllByText('Quick View', {
        exact: false,
      })[0];

      // Get the top Stretch Recommended Curriculum for the first test curriculum.
      // (As per the logic in CurriculumCatalog.jsx, if the top Stretch result is
      // the same as the top Similar result, then it will get the 2nd Stretch
      // result)
      const firstTestCurriculum = FULL_TEST_COURSES[0];
      const recommendedSimilarCurriculum = getSimilarRecommendations(
        FULL_TEST_COURSES,
        firstTestCurriculum.key,
        null
      )[0];
      const stretchCurriculumRecommendations = getStretchRecommendations(
        FULL_TEST_COURSES,
        firstTestCurriculum.key,
        null
      );
      const recommendedStretchCurriculum =
        recommendedSimilarCurriculum.key ===
        stretchCurriculumRecommendations[0].key
          ? stretchCurriculumRecommendations[1]
          : stretchCurriculumRecommendations[0];

      // Open expanded card of the first test curriculum
      fireEvent.click(firstQuickViewButton);
      screen.getByText(firstTestCurriculum.description);

      // Check that sessionStorage has result of Stretch Curriculum Recommender
      const storedRecommenderResults = JSON.parse(
        tryGetSessionStorage('stretchRecommenderResults', '{}')
      );

      expect(storedRecommenderResults[firstTestCurriculum.key].key).to.equal(
        recommendedStretchCurriculum.key
      );
    });
  });
});
