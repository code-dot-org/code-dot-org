import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import LessonEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/LessonEditor';
import {
  stubRedux,
  restoreRedux,
  getStore,
  registerReducers
} from '@cdo/apps/redux';
import reducers, {
  init
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import {levelKeyList, sampleActivities} from './activitiesTestData';
import {Provider} from 'react-redux';

describe('LessonEditor', () => {
  let defaultProps, store;
  beforeEach(() => {
    stubRedux();
    registerReducers({...reducers});

    store = getStore();
    store.dispatch(init(sampleActivities, levelKeyList));
    defaultProps = {
      displayName: 'Lesson Name',
      overview: 'Lesson Overview',
      studentOverview: 'Overview of the lesson for students',
      unplugged: false,
      lockable: false,
      assessment: false,
      creativeCommonsLicense: 'Creative Commons BY-NC-SA',
      purpose: 'The purpose of the lesson is for people to learn',
      preparation: '- One',
      announcements: [],
      relatedLessons: []
    };
  });

  afterEach(() => {
    restoreRedux();
  });

  const createWrapper = overrideProps => {
    const combinedProps = {...defaultProps, ...overrideProps};
    return mount(
      <Provider store={store}>
        <LessonEditor {...combinedProps} />
      </Provider>
    );
  };

  it('renders default props', () => {
    const wrapper = createWrapper({});
    expect(wrapper.contains('Lesson Name'), 'Lesson Name').to.be.true;
    expect(wrapper.contains('Lesson Overview'), 'Lesson Overview').to.be.true;
    expect(
      wrapper.contains('Overview of the lesson for students'),
      'student overview'
    ).to.be.true;
    expect(
      wrapper.contains('The purpose of the lesson is for people to learn'),
      'purpose'
    ).to.be.true;
    expect(wrapper.find('Connect(ActivitiesEditor)').length).to.equal(1);
    expect(wrapper.find('TextareaWithMarkdownPreview').length).to.equal(4);
    expect(wrapper.find('input').length).to.equal(18);
    expect(wrapper.find('select').length).to.equal(1);
    expect(wrapper.find('AnnouncementsEditor').length).to.equal(1);
    expect(wrapper.find('CollapsibleEditorSection').length).to.equal(6);
  });
});
