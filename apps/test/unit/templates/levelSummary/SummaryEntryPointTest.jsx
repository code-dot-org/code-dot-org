import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';

import SummaryEntryPoint from '@cdo/apps/templates/levelSummary/SummaryEntryPoint';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

import styles from '@cdo/apps/templates/levelSummary/summary-entry-point.module.scss';

const JS_DATA = {
  response_count: 1,
  is_contained_level: false,
};

const INITIAL_STATE = {
  teacherSections: {
    selectedStudents: [{id: 0}],
    selectedSectionId: 0,
    sectionIds: [0],
    sections: [{id: 0, name: 'test section'}],
  },
};

const setUpWrapper = (state = {}, jsData = {}) => {
  const store = createStore(
    combineReducers({
      teacherSections,
    }),
    {...INITIAL_STATE, ...state}
  );

  const wrapper = mount(
    <Provider store={store}>
      <SummaryEntryPoint scriptData={{...JS_DATA, ...jsData}} />
    </Provider>
  );

  return wrapper;
};

describe('SummaryEntryPoint', () => {
  it('renders elements', () => {
    const wrapper = setUpWrapper();

    // Renders link correctly.
    expect(wrapper.find('a').length).toBe(1);
    expect(wrapper.find('a').prop('href')).toMatch(/^\/[^\/]*\/summary/);
    // Student/response counter
    expect(wrapper.find(`[data-testid="response-counter"]`).text()).toBe(
      '1/1 students answered'
    );
  });

  it('adds standalone class on non-contained levels', () => {
    const wrapper = setUpWrapper();

    expect(wrapper.find(`.${styles.isStandalone}`).length).toBe(1);
  });

  it('does not add standalone class on contained levels', () => {
    const wrapper = setUpWrapper({}, {is_contained_level: true});

    expect(wrapper.find(`.${styles.isStandalone}`).length).toBe(0);
  });

  it('does not render response counter/text if no section selected', () => {
    const wrapper = setUpWrapper({
      teacherSections: {
        selectedStudents: [{id: 0}],
        selectedSectionId: null,
        sectionIds: [0],
        sections: [{id: 0, name: 'test section'}],
      },
    });

    expect(wrapper.find(`.fa`).length).toBe(0);
    expect(wrapper.find(`[data-testid="response-counter"]`).length).toBe(0);
  });
});
