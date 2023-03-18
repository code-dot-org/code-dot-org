import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';
import CheckForUnderstanding from '@cdo/apps/templates/levelSummary/CheckForUnderstanding';
import styles from '@cdo/apps/templates/levelSummary/check-for-understanding.module.scss';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import viewAs from '@cdo/apps/code-studio/viewAsRedux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import progress from '@cdo/apps/code-studio/progressRedux';

const JS_DATA = {
  level: {
    type: 'FreeResponse',
    id: 0,
    properties: {
      long_instructions: 'test'
    }
  },
  last_attempt: 'teacher answer',
  responses: [{user_id: 0, text: 'student answer'}]
};

const INITIAL_STATE = {
  isRtl: false,
  viewAs: 'Instructor',
  teacherSections: {
    selectedStudents: [{id: 0}],
    selectedSectionId: 0,
    sectionIds: [0],
    sections: [{id: 0, name: 'test section'}]
  },
  progress: {
    currentLessonId: 0,
    currentLevelId: '0',
    lessons: [
      {
        id: 0,
        levels: [{activeId: '0', position: 1}]
      }
    ]
  }
};

const setUpWrapper = (state = {}, jsData = {}) => {
  const div = document.createElement('div');
  div.setAttribute('id', 'attach-to-div');
  const script = document.createElement('script');
  script.dataset.summary = JSON.stringify({...JS_DATA, ...jsData});
  document.head.appendChild(script);
  document.body.appendChild(div);

  const store = createStore(
    combineReducers({
      isRtl,
      viewAs,
      teacherSections,
      progress
    }),
    {...INITIAL_STATE, ...state}
  );

  const wrapper = mount(
    <Provider store={store}>
      <CheckForUnderstanding />
    </Provider>,
    {attachTo: div}
  );

  return wrapper;
};

describe('CheckForUnderstanding', () => {
  afterEach(() => {
    document.head.removeChild(document.querySelector('script[data-summary]'));
    document.body.removeChild(document.querySelector('#attach-to-div'));
  });

  it('renders elements', () => {
    const wrapper = setUpWrapper();

    // Back link, but no next link.
    expect(wrapper.find(`.${styles.navLinks} a`).length).to.eq(1);
    // Question markdown, but no teacher markdown.
    expect(wrapper.find('SafeMarkdown').length).to.eq(1);
    // No question title.
    expect(wrapper.find('h1').length).to.eq(0);
    // Free response question.
    expect(wrapper.find('textarea').length).to.eq(1);
    // Student responses.
    expect(wrapper.find(`.${styles.studentsSubmittedRight}`).text()).to.eq(
      '1/1 students answered'
    );
    expect(wrapper.find(`div.${styles.studentAnswer}`).length).to.eq(1);
    // Section selector, with one section.
    expect(wrapper.find('SectionSelector').length).to.eq(1);
    expect(wrapper.find('SectionSelector option').length).to.eq(2);
  });

  it('applies correct classes when rtl', () => {
    const wrapper = setUpWrapper({
      isRtl: true,
      progress: {
        currentLessonId: 0,
        currentLevelId: '0',
        lessons: [
          {
            id: 0,
            levels: [{activeId: '0', position: 1}, {activeId: '1', position: 2}]
          }
        ]
      }
    });

    expect(wrapper.find(`.${styles.studentsSubmittedRight}`).length).to.eq(0);
    expect(wrapper.find(`.${styles.studentsSubmittedLeft}`).length).to.eq(1);

    expect(wrapper.find(`.${styles.navLinkRight}`).length).to.eq(0);
    expect(wrapper.find(`.${styles.navLinkLeft}`).length).to.eq(1);
  });

  it('renders teacher markdown if defined', () => {
    const wrapper = setUpWrapper(
      {},
      {teacher_markdown: 'test teacher markdown'}
    );

    expect(wrapper.find('SafeMarkdown').length).to.eq(2);
    expect(
      wrapper
        .find('SafeMarkdown')
        .at(1)
        .text()
    ).to.eq('test teacher markdown');
  });
});
