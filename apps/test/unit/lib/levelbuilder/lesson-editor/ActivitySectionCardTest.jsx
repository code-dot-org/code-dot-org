import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';

import reducers, {
  initActivities,
  initLevelSearching,
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import {UnconnectedActivitySectionCard as ActivitySectionCard} from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivitySectionCard';
import createResourcesReducer, {
  initResources,
} from '@cdo/apps/lib/levelbuilder/lesson-editor/resourcesEditorRedux';
import vocabulariesEditor, {
  initVocabularies,
} from '@cdo/apps/lib/levelbuilder/lesson-editor/vocabulariesEditorRedux';
import {
  stubRedux,
  restoreRedux,
  getStore,
  registerReducers,
} from '@cdo/apps/redux';

import {allowConsoleWarnings} from '../../../../util/throwOnConsole';

import {sampleActivities, searchOptions} from './activitiesTestData';
import resourceTestData from './resourceTestData';

describe('ActivitySectionCard', () => {
  // Warnings allowed due to usage of deprecated componentWillReceiveProps
  // lifecycle method.
  allowConsoleWarnings();

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
      vocabularies: vocabulariesEditor,
    });

    store = getStore();
    store.dispatch(initActivities(sampleActivities));
    store.dispatch(
      initLevelSearching({
        searchOptions: searchOptions,
        programmingEnvironments: [],
      })
    );
    store.dispatch(initResources('lessonResource', resourceTestData));
    store.dispatch(initVocabularies([]));

    setTargetActivitySection = jest.fn();
    updateTargetActivitySection = jest.fn();
    clearTargetActivitySection = jest.fn();
    updateActivitySectionMetrics = jest.fn();
    moveActivitySection = jest.fn();
    removeActivitySection = jest.fn();
    updateActivitySectionField = jest.fn();
    reorderLevel = jest.fn();
    moveLevelToActivitySection = jest.fn();
    addLevel = jest.fn();
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
      allowMajorCurriculumChanges: true,

      //redux
      moveActivitySection,
      removeActivitySection,
      updateActivitySectionField,
      reorderLevel,
      moveLevelToActivitySection,
      addLevel,
    };
  });

  afterEach(() => {
    restoreRedux();
  });

  it('renders activity section without levels', () => {
    const wrapper = shallow(<ActivitySectionCard {...defaultProps} />);
    expect(wrapper.find('Connect(ActivitySectionCardButtons)').length).toBe(1);
    expect(wrapper.find('LevelToken').length).toBe(0);
    expect(wrapper.find('textarea').length).toBe(1);
    expect(wrapper.find('OrderControls').length).toBe(1);
    expect(wrapper.contains('Remarks')).toBe(true);
    expect(wrapper.contains('Progression Title:')).toBe(false);
  });

  it('show OrderControls when allowed to make major curriculum changes', () => {
    const wrapper = shallow(
      <ActivitySectionCard
        {...defaultProps}
        allowMajorCurriculumChanges={true}
      />
    );
    expect(wrapper.find('OrderControls').length).toBe(1);
  });

  it('hides OrderControls when not allowed to make major curriculum changes and levels in activity section', () => {
    const wrapper = shallow(
      <ActivitySectionCard
        {...defaultProps}
        allowMajorCurriculumChanges={false}
        activitySection={sampleActivities[0].activitySections[2]}
      />
    );
    expect(wrapper.find('OrderControls').length).toBe(0);
  });

  it('show OrderControls when not allowed to make major curriculum changes and no levels in activity section', () => {
    const wrapper = shallow(
      <ActivitySectionCard
        {...defaultProps}
        allowMajorCurriculumChanges={false}
      />
    );
    expect(wrapper.find('OrderControls').length).toBe(1);
  });

  it('renders activity section with levels', () => {
    const wrapper = shallow(
      <ActivitySectionCard
        {...defaultProps}
        activitySection={sampleActivities[0].activitySections[2]}
      />
    );
    expect(wrapper.find('Connect(ActivitySectionCardButtons)').length).toBe(1);
    expect(wrapper.find('Connect(UnconnectedLevelToken)').length).toBe(2);
    expect(wrapper.find('textarea').length).toBe(1);
    expect(wrapper.find('OrderControls').length).toBe(1);
    expect(wrapper.contains('Progression Title:')).toBe(true);
  });

  it('renders activity section with levels for lesson with lesson plan', () => {
    const wrapper = shallow(
      <ActivitySectionCard
        {...defaultProps}
        activitySection={sampleActivities[0].activitySections[2]}
        hasLessonPlan={false}
      />
    );
    expect(wrapper.find('Connect(ActivitySectionCardButtons)').length).toBe(1);
    expect(wrapper.find('Connect(UnconnectedLevelToken)').length).toBe(2);
    expect(wrapper.find('textarea').length).toBe(0);
    expect(wrapper.find('OrderControls').length).toBe(1);
    expect(wrapper.contains('Progression Title:')).toBe(true);
  });

  it('edit activity section title', () => {
    const wrapper = shallow(<ActivitySectionCard {...defaultProps} />);

    const titleInput = wrapper.find('input').at(0);
    titleInput.simulate('change', {target: {value: 'New Title'}});
    expect(updateActivitySectionField).toHaveBeenCalledWith(
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
    expect(updateActivitySectionField).toHaveBeenCalledWith(
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
    expect(updateActivitySectionField).toHaveBeenCalledWith(
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
    expect(updateActivitySectionField).toHaveBeenCalledWith(
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
    expect(updateActivitySectionField).toHaveBeenCalledWith(
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

    expect(wrapper.find('OrderControls').length).toBe(1);
    const orderControls = wrapper.find('OrderControls');
    expect(orderControls.find('.fa-caret-down').length).toBe(1);
    const down = orderControls.find('.fa-caret-down');
    down.simulate('mouseDown');

    expect(moveActivitySection).toHaveBeenCalledWith(1, 1, 'down');
  });

  it('can not move activity section up if first activity section in first activity', () => {
    const wrapper = mount(
      <Provider store={store}>
        <ActivitySectionCard {...defaultProps} />
      </Provider>
    );

    expect(wrapper.find('OrderControls').length).toBe(1);
    const orderControls = wrapper.find('OrderControls');
    expect(orderControls.find('.fa-caret-up').length).toBe(1);
    const up = orderControls.find('.fa-caret-up');
    up.simulate('mouseDown');

    expect(moveActivitySection).not.toHaveBeenCalled();
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

    expect(wrapper.find('OrderControls').length).toBe(1);
    const orderControls = wrapper.find('OrderControls');
    expect(orderControls.find('.fa-caret-up').length).toBe(1);
    const up = orderControls.find('.fa-caret-up');
    up.simulate('mouseDown');

    expect(moveActivitySection).toHaveBeenCalledWith(2, 1, 'up');
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

    expect(wrapper.find('OrderControls').length).toBe(1);
    const orderControls = wrapper.find('OrderControls');
    expect(orderControls.find('.fa-caret-down').length).toBe(1);
    const down = orderControls.find('.fa-caret-down');
    down.simulate('mouseDown');

    expect(moveActivitySection).not.toHaveBeenCalled();
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
    expect(updateActivitySectionField.mock.lastCall[3]).toBe(
      'new syntax Simple text'
    );

    // inserting with a cursor position will insert at that position
    instance.editorTextAreaRef.selectionStart = 6;
    instance.insertMarkdownSyntaxAtSelection(' new syntax');
    expect(updateActivitySectionField.mock.lastCall[3]).toBe(
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
    expect(updateActivitySectionField.mock.lastCall[3]).toBe(
      'Basic insertion text'
    );

    instance.editorTextAreaRef.selectionStart = 7;
    instance.editorTextAreaRef.selectionEnd = 11;
    instance.insertMarkdownSyntaxAtSelection('example');
    expect(updateActivitySectionField.mock.lastCall[3]).toBe('Simple example');
  });
});
