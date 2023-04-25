import React from 'react';
import ActivitiesEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/ActivitiesEditor';
import {createStoreWithReducers, registerReducers} from '@cdo/apps/redux';
import reducers, {
  initActivities,
  initLevelSearching,
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import createResourcesReducer, {
  initResources,
} from '@cdo/apps/lib/levelbuilder/lesson-editor/resourcesEditorRedux';
import vocabulariesEditor, {
  initVocabularies,
} from '@cdo/apps/lib/levelbuilder/lesson-editor/vocabulariesEditorRedux';
import {Provider} from 'react-redux';
import {
  sampleActivities,
  sampleActivityForLessonWithoutLessonPlan,
  searchOptions,
} from '../../../../test/unit/lib/levelbuilder/lesson-editor/activitiesTestData';
import {allowConsoleWarnings} from '../../../../test/util/testUtils';

export default {
  title: 'ActivitiesEditor',
  component: ActivitiesEditor,
};

const resourcesEditor = createResourcesReducer('lessonResource');

const createStoreWithLessonPlan = () => {
  registerReducers({
    ...reducers,
    resources: resourcesEditor,
    vocabularies: vocabulariesEditor,
  });
  const store = createStoreWithReducers();
  store.dispatch(initActivities(sampleActivities));
  store.dispatch(
    initLevelSearching({
      searchOptions: searchOptions,
      programmingEnvironments: [],
    })
  );
  store.dispatch(initResources('lessonResource', []));
  store.dispatch(initVocabularies([]));
  return store;
};

const createStoreWithoutLessonPlan = () => {
  registerReducers({
    ...reducers,
    resources: resourcesEditor,
    vocabularies: vocabulariesEditor,
  });
  const store = createStoreWithReducers();
  store.dispatch(initActivities([sampleActivityForLessonWithoutLessonPlan]));
  store.dispatch(
    initLevelSearching({
      searchOptions: searchOptions,
      programmingEnvironments: [],
    })
  );
  store.dispatch(initResources('lessonResource', []));
  store.dispatch(initVocabularies([]));
  return store;
};

if (IN_UNIT_TEST) {
  allowConsoleWarnings();
}

//
// TEMPLATE
//

// Note the template names reference whether the store has a lesson plan, which
// is different from whether the hasLessonPlan prop is true or false.
const TemplateStoreWithLessonPlan = args => (
  <Provider store={createStoreWithLessonPlan()}>
    <ActivitiesEditor {...args} />
  </Provider>
);

const TemplateStoreWithoutLessonPlan = args => (
  <Provider store={createStoreWithoutLessonPlan()}>
    <ActivitiesEditor {...args} />
  </Provider>
);

//
// STORIES
//

export const ForLessonWithLessonPlan = TemplateStoreWithLessonPlan.bind({});
ForLessonWithLessonPlan.args = {
  hasLessonPlan: true,
  allowMajorCurriculumChanges: true,
};

export const ForLessonWithoutLessonPlan = TemplateStoreWithoutLessonPlan.bind(
  {}
);
ForLessonWithoutLessonPlan.args = {
  hasLessonPlan: false,
  allowMajorCurriculumChanges: true,
};

export const WhenMajorChangesNotAllowed = TemplateStoreWithoutLessonPlan.bind(
  {}
);
WhenMajorChangesNotAllowed.args = {
  hasLessonPlan: true,
  allowMajorCurriculumChanges: false,
};
