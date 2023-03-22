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
  const div = document.createElement('div');
  div.setAttribute('id', 'attach-to-div');
  const script = document.createElement('script');
  script.dataset.freeresponse = JSON.stringify({...JS_DATA, ...jsData});
  document.head.appendChild(script);
  document.body.appendChild(div);

  const store = createStore(
    combineReducers({
      teacherSections
    }),
    {...INITIAL_STATE, ...state}
  );

  const wrapper = mount(
    <Provider store={store}>
      <SummaryEntryPoint />
    </Provider>,
    {attachTo: div}
  );

  return wrapper;
};

describe('SummaryEntryPoint', () => {
  afterEach(() => {
    document.head.removeChild(
      document.querySelector('script[data-freeresponse]')
    );
    document.body.removeChild(document.querySelector('#attach-to-div'));
  });

  it('renders elements', () => {
    const wrapper = setUpWrapper();

    // Renders link correctly.
    expect(wrapper.find('a').length).to.eq(1);
    expect(wrapper.find('a').prop('href')).to.match(/\/summary$/);
    // Student/response counter
    expect(wrapper.find(`.${styles.responseCounter}`).text()).to.eq(
      '1/1 students answered'
    );
  });
});
