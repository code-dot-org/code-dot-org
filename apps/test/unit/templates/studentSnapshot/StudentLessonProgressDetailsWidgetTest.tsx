import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import StudentLessonProgressDetailsWidget from '@cdo/apps/templates/studentSnapshot/studentLessonProgressDetailsWidget';

const buildStore = (isLoadingProgress: boolean) =>
  createStore(() => ({
    sectionProgress: {
      unitDataByUnit: {
        1: {
          id: 1,
          lessons: {
            0: {id: 10, script_id: 1, relative_position: 1, levels: {}},
          },
        },
      },
      studentLevelProgressByUnit: {},
      studentLessonProgressByUnit: {},
      isLoadingProgress,
    },
    teacherSections: {
      selectedStudents: [{id: 1}],
    },
  }));

describe('StudentLessonProgressDetailsWidget', () => {
  it('shows the loading state when selectedLessonId is null and progress is still loading', () => {
    render(
      <Provider store={buildStore(true)}>
        <StudentLessonProgressDetailsWidget
          selectedUnitId={1}
          selectedLessonId={null}
          selectedStudentId={1}
        />
      </Provider>
    );

    expect(document.getElementById('uitest-spinner')).toBeInTheDocument();
  });

  it('shows the loading state when selectedStudentId is null and progress is still loading', () => {
    render(
      <Provider store={buildStore(true)}>
        <StudentLessonProgressDetailsWidget
          selectedUnitId={1}
          selectedLessonId={10}
          selectedStudentId={null}
        />
      </Provider>
    );

    expect(document.getElementById('uitest-spinner')).toBeInTheDocument();
  });

  it('hides once loading finishes with no lesson selected', () => {
    const {container} = render(
      <Provider store={buildStore(false)}>
        <StudentLessonProgressDetailsWidget
          selectedUnitId={1}
          selectedLessonId={null}
          selectedStudentId={1}
        />
      </Provider>
    );

    expect(document.getElementById('uitest-spinner')).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });

  it('hides once loading finishes with no student selected', () => {
    const {container} = render(
      <Provider store={buildStore(false)}>
        <StudentLessonProgressDetailsWidget
          selectedUnitId={1}
          selectedLessonId={10}
          selectedStudentId={null}
        />
      </Provider>
    );

    expect(document.getElementById('uitest-spinner')).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the full details once both a lesson and a student are selected', () => {
    render(
      <Provider store={buildStore(false)}>
        <StudentLessonProgressDetailsWidget
          selectedUnitId={1}
          selectedLessonId={10}
          selectedStudentId={1}
        />
      </Provider>
    );

    expect(document.getElementById('uitest-spinner')).not.toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('Validation tests')).toBeInTheDocument();
    expect(screen.getByText('Time spent')).toBeInTheDocument();
  });
});
