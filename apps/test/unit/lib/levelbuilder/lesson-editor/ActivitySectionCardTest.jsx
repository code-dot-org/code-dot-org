import React from 'react';
import {shallow, mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedActivitySectionCard as ActivitySectionCard} from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivitySectionCard';
import sinon from 'sinon';
import {
  stubRedux,
  restoreRedux,
  getStore,
  registerReducers
} from '@cdo/apps/redux';
import {Provider} from 'react-redux';
import resourceTestData from './resourceTestData';
import {sampleActivities, searchOptions} from './activitiesTestData';
import reducers, {
  init
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import createResourcesReducer, {
  initResources
} from '@cdo/apps/lib/levelbuilder/lesson-editor/resourcesEditorRedux';
import vocabulariesEditor, {
  initVocabularies
} from '@cdo/apps/lib/levelbuilder/lesson-editor/vocabulariesEditorRedux';

describe('ActivitySectionCard', () => {
  let defaultProps,
    store,
    setTargetActivitySection,
    updateTargetActivitySection,
    clearTargetActivitySection,
    updateActivitySectionMetrics,
    moveActivitySection,
    removeActivitySection,
    updateActivitySectionField,
    reorderLevel,
    moveLevelToActivitySection,
    addLevel;
  beforeEach(() => {
    stubRedux();
    registerReducers({
      ...reducers,
      resources: createResourcesReducer('lessonResource'),
      vocabularies: vocabulariesEditor
    });

    store = getStore();
    store.dispatch(init(sampleActivities, searchOptions, [], false));
    store.dispatch(initResources('lessonResource', resourceTestData));
    store.dispatch(initVocabularies([]));

    setTargetActivitySection = sinon.spy();
    updateTargetActivitySection = sinon.spy();
    clearTargetActivitySection = sinon.spy();
    updateActivitySectionMetrics = sinon.spy();
    moveActivitySection = sinon.spy();
    removeActivitySection = sinon.spy();
    updateActivitySectionField = sinon.spy();
    reorderLevel = sinon.spy();
    moveLevelToActivitySection = sinon.spy();
    addLevel = sinon.spy();
    defaultProps = {
      activitySection: sampleActivities[0].activitySections[0],
      activityPosition: 1,
      activitySectionsCount: 3,
      activitiesCount: 1,
      activitySectionMetrics: [],
      updateTargetActivitySection,
      clearTargetActivitySection,
      updateActivitySectionMetrics,
      setTargetActivitySection,
      targetActivitySectionPos: 1,
      hasLessonPlan: true,

      //redux
      moveActivitySection,
      removeActivitySection,
      updateActivitySectionField,
      reorderLevel,
      moveLevelToActivitySection,
      addLevel
    };
  });

  afterEach(() => {
    restoreRedux();
  });

  it('renders activity section without levels', () => {
    const wrapper = shallow(<ActivitySectionCard {...defaultProps} />);
    expect(wrapper.find('Connect(ActivitySectionCardButtons)').length).to.equal(
      1
    );
    expect(wrapper.find('LevelToken').length).to.equal(0);
    expect(wrapper.find('textarea').length).to.equal(1);
    expect(wrapper.find('OrderControls').length).to.equal(1);
    expect(wrapper.contains('Remarks')).to.be.true;
    expect(wrapper.contains('Progression Title:')).to.be.false;
  });

  it('renders activity section with levels', () => {
    const wrapper = shallow(
      <ActivitySectionCard
        {...defaultProps}
        activitySection={sampleActivities[0].activitySections[2]}
      />
    );
    expect(wrapper.find('Connect(ActivitySectionCardButtons)').length).to.equal(
      1
    );
    expect(wrapper.find('Connect(UnconnectedLevelToken)').length).to.equal(2);
    expect(wrapper.find('textarea').length).to.equal(1);
    expect(wrapper.find('OrderControls').length).to.equal(1);
    expect(wrapper.contains('Progression Title:')).to.be.true;
  });

  it('renders activity section with levels for lesson with lesson plan', () => {
    const wrapper = shallow(
      <ActivitySectionCard
        {...defaultProps}
        activitySection={sampleActivities[0].activitySections[2]}
        hasLessonPlan={false}
      />
    );
    expect(wrapper.find('Connect(ActivitySectionCardButtons)').length).to.equal(
      1
    );
    expect(wrapper.find('Connect(UnconnectedLevelToken)').length).to.equal(2);
    expect(wrapper.find('textarea').length).to.equal(0);
    expect(wrapper.find('OrderControls').length).to.equal(1);
    expect(wrapper.contains('Progression Title:')).to.be.true;
  });

  it('edit activity section title', () => {
    const wrapper = shallow(<ActivitySectionCard {...defaultProps} />);

    const titleInput = wrapper.find('input').at(0);
    titleInput.simulate('change', {target: {value: 'New Title'}});
    expect(updateActivitySectionField).to.have.been.calledWith(
      1,
      1,
      'displayName',
      'New Title'
    );
  });

  it('edit activity section duration', () => {
    const wrapper = shallow(<ActivitySectionCard {...defaultProps} />);

    const durationInput = wrapper.find('input').at(1);
    durationInput.simulate('change', {target: {value: '5'}});
    expect(updateActivitySectionField).to.have.been.calledWith(
      1,
      1,
      'duration',
      '5'
    );
  });

  it('edit activity section remarks', () => {
    const wrapper = shallow(<ActivitySectionCard {...defaultProps} />);

    const remarksInput = wrapper.find('input').at(2);
    remarksInput.simulate('change', {target: {value: ''}});
    expect(updateActivitySectionField).to.have.been.calledWith(
      1,
      1,
      'remarks',
      false
    );
  });

  it('edit activity section progressionName', () => {
    const wrapper = shallow(
      <ActivitySectionCard
        {...defaultProps}
        activitySection={sampleActivities[0].activitySections[2]}
      />
    );

    const progressionInput = wrapper.find('input').at(3);
    progressionInput.simulate('change', {target: {value: 'Progression Name'}});
    expect(updateActivitySectionField).to.have.been.calledWith(
      1,
      3,
      'progressionName',
      'Progression Name'
    );
  });

  it('edit activity section description', () => {
    const wrapper = shallow(<ActivitySectionCard {...defaultProps} />);

    const titleInput = wrapper.find('textarea').at(0);
    titleInput.simulate('change', {target: {value: 'My section description'}});
    expect(updateActivitySectionField).to.have.been.calledWith(
      1,
      1,
      'text',
      'My section description'
    );
  });

  it('can move activity section down to next activity', () => {
    const wrapper = mount(
      <Provider store={store}>
        <ActivitySectionCard {...defaultProps} />
      </Provider>
    );

    expect(wrapper.find('OrderControls').length).to.equal(1);
    const orderControls = wrapper.find('OrderControls');
    expect(orderControls.find('.fa-caret-down').length).to.equal(1);
    const down = orderControls.find('.fa-caret-down');
    down.simulate('mouseDown');

    expect(moveActivitySection).to.have.been.calledWith(1, 1, 'down');
  });

  it('can not move activity section up if first activity section in first activity', () => {
    const wrapper = mount(
      <Provider store={store}>
        <ActivitySectionCard {...defaultProps} />
      </Provider>
    );

    expect(wrapper.find('OrderControls').length).to.equal(1);
    const orderControls = wrapper.find('OrderControls');
    expect(orderControls.find('.fa-caret-up').length).to.equal(1);
    const up = orderControls.find('.fa-caret-up');
    up.simulate('mouseDown');

    expect(moveActivitySection).to.not.have.been.called;
  });

  it('can move activity section up to previous activity', () => {
    const wrapper = mount(
      <Provider store={store}>
        <ActivitySectionCard
          {...defaultProps}
          activityPosition={2}
          activitiesCount={2}
        />
      </Provider>
    );

    expect(wrapper.find('OrderControls').length).to.equal(1);
    const orderControls = wrapper.find('OrderControls');
    expect(orderControls.find('.fa-caret-up').length).to.equal(1);
    const up = orderControls.find('.fa-caret-up');
    up.simulate('mouseDown');

    expect(moveActivitySection).to.have.been.calledWith(2, 1, 'up');
  });

  it('can not move activity section down if last activity section in last activity', () => {
    const wrapper = mount(
      <Provider store={store}>
        <ActivitySectionCard
          {...defaultProps}
          activityPosition={2}
          activitiesCount={2}
          activitySection={sampleActivities[0].activitySections[2]}
        />
      </Provider>
    );

    expect(wrapper.find('OrderControls').length).to.equal(1);
    const orderControls = wrapper.find('OrderControls');
    expect(orderControls.find('.fa-caret-down').length).to.equal(1);
    const down = orderControls.find('.fa-caret-down');
    down.simulate('mouseDown');

    expect(moveActivitySection).to.not.have.been.called;
  });

  it('can insert at text cusor positon with insertMarkdownSyntaxAtSelection', () => {
    const wrapper = mount(
      <Provider store={store}>
        <ActivitySectionCard {...defaultProps} />
      </Provider>
    );
    const instance = wrapper.find('ActivitySectionCard').instance();

    // inserting without a cursor position will insert at the beginning
    instance.insertMarkdownSyntaxAtSelection('new syntax ');
    expect(updateActivitySectionField.lastCall.args[3]).to.equal(
      'new syntax Simple text'
    );

    // inserting with a cursor position will insert at that position
    instance.editorTextAreaRef.selectionStart = 6;
    instance.insertMarkdownSyntaxAtSelection(' new syntax');
    expect(updateActivitySectionField.lastCall.args[3]).to.equal(
      'Simple new syntax text'
    );
  });

  it('can replace selected text with insertMarkdownSyntaxAtSelection', () => {
    const wrapper = mount(
      <Provider store={store}>
        <ActivitySectionCard {...defaultProps} />
      </Provider>
    );
    const instance = wrapper.find('ActivitySectionCard').instance();
    instance.editorTextAreaRef.selectionStart = 0;
    instance.editorTextAreaRef.selectionEnd = 6;
    instance.insertMarkdownSyntaxAtSelection('Basic insertion');
    expect(updateActivitySectionField.lastCall.args[3]).to.equal(
      'Basic insertion text'
    );

    instance.editorTextAreaRef.selectionStart = 7;
    instance.editorTextAreaRef.selectionEnd = 11;
    instance.insertMarkdownSyntaxAtSelection('example');
    expect(updateActivitySectionField.lastCall.args[3]).to.equal(
      'Simple example'
    );
  });
});
