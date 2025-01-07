import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import SuggestedAssignableCourses from '@cdo/apps/templates/certificates/SuggestedAssignableCourses';
import teacherSections, {
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

import {sections} from '../studioHomepages/fakeSectionUtils';

describe('SuggestedAssignableCourses', () => {
  let store;

  const defaultCourseProps = {
    key: 'csp',
    display_name: 'Computer Science Principles',
    display_name_with_latest_year: "Computer Science Principles '24-'25",
    marketing_initiative: 'CSP',
    grade_levels: '9,10,11,12',
    duration: 'school_year',
    image: 'https://images.code.org/2e9909d96d22a5d4ded2bb80550fc399-CSP.png',
    cs_topic: 'app_design,cybersecurity,data,internet,programming',
    school_subject: null,
    device_compatibility:
      '{"computer":"ideal","chromebook":"ideal","tablet":"incompatible","mobile":"incompatible","no_device":"incompatible"}',
    course_version_path: '/courses/csp-2024',
    course_version_id: 1363,
    course_id: 173,
    course_offering_id: 10,
    script_id: null,
    is_standalone_unit: false,
    is_translated: true,
    description:
      'Taught as an intro or AP course, this curriculum introduces students to computer science and challenges them to explore how technology can impact the world. ',
    professional_learning_program: 'https://code.org/apply',
    video:
      'https://www.youtube-nocookie.com/embed/jQm0z894CG0/?autoplay=1&enablejsapi=1&iv_load_policy=3&modestbranding=1&rel=0&showinfo=1&v=jQm0z894CG0&wmode=transparent',
    published_date: '2023-07-10T13:00:00.000Z',
    self_paced_pl_course_offering_path: '/courses/self-paced-pl-csp-2024',
    available_resources: {
      'Lesson Plan': '/s/csp1-2024/lessons/1',
      'Slide Deck':
        'https://docs.google.com/presentation/d/1ccxlBnconEF4KdNTkB-RhzJje5xMviicrhHqTp_QSio/template/preview',
      'Activity Guide':
        'https://docs.google.com/document/d/1rUAaOVwSMBDYLoXKGhL5lxZix-Hgw51mzDvcgiF8RuE/view',
      Rubric:
        'https://docs.google.com/document/d/1v3BHA47QuQu9USBcrQvALigzlNNtQzaojlDQuZ57LZA/view',
      'Answer Key':
        'https://docs.google.com/presentation/d/17jJG9aGnvUsS_HClqDoAW7LkPS51PIsv2Q1npTlsbwM/edit?usp=sharing',
    },
  };

  beforeEach(() => {
    stubRedux();
    registerReducers({teacherSections});
    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
  });

  const renderComponent = (courses = [defaultCourseProps]) => {
    store.dispatch(setSections(sections));
    render(
      <Provider store={store}>
        <SuggestedAssignableCourses
          assignableCourseSuggestions={courses}
          isEnglish
        />
      </Provider>
    );
  };

  it('renders a card for an assignable course', () => {
    renderComponent();
    screen.findByText('AI for Oceans');
  });

  it('expands single card', async () => {
    renderComponent();
    await screen
      .getByRole('button', {
        name: 'View details about Computer Science Principles',
      })
      .click();
    await screen.findByText('Available Resources');
    await screen.findByText('See curriculum details');
  });

  it('shows assign dialog when assign is clicked', async () => {
    renderComponent();
    await screen
      .getByRole('button', {
        name: 'Assign Computer Science Principles to your classroom',
      })
      .click();

    await screen.findByText(
      'Which section(s) do you want to assign "Computer Science Principles \'24-\'25" to?'
    );
    await screen.findByText(sections[0].name);
  });
});
