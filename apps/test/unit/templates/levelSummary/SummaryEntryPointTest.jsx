import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';
import SummaryEntryPoint from '@cdo/apps/templates/levelSummary/SummaryEntryPoint';
import styles from '@cdo/apps/templates/levelSummary/summary-entry-point.module.scss';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

const JS_DATA = {
  responses: [{user_id: 0, text: 'student answer'}]
};

const INITIAL_STATE = {
  teacherSections: {
    selectedStudents: [{id: 0}]
  }
};

const setUpWrapper = (state = {}, jsData = {}) => {
  const store = createStore(
    combineReducers({
      teacherSections
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
    expect(wrapper.find('a').length).to.eq(1);
    expect(wrapper.find('a').prop('href')).to.match(/^\/[^\/]*\/summary/);
    // Student/response counter
    expect(wrapper.find(`.${styles.responseCounter}`).text()).to.eq(
      '1/1 students answered'
    );
  });
});
