import {configureStore} from '@reduxjs/toolkit';
import {render} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import {setHostedDrawerConfig} from '@cdo/apps/aiTeacherDrawer/redux';
import {aiDiffChatReducer} from '@cdo/apps/aiTeacherDrawer/redux/slice';
import RubricFABContainer from '@cdo/apps/lab2/views/components/rubrics/RubricFABContainer';
import {useRubric} from '@cdo/apps/lab2/views/components/rubrics/RubricWrapper';
import experiments from '@cdo/apps/util/experiments';
import {AiDiffContext} from '@cdo/generated-scripts/sharedConstants';

jest.mock('@cdo/apps/lab2/views/components/rubrics/RubricWrapper', () => ({
  useRubric: jest.fn(),
}));
jest.mock('@cdo/apps/lab2/views/LevelPropertiesWrapper', () => ({
  useLevelProperties: () => ({
    levelProperties: {
      name: 'rubric-level',
      appName: 'weblab2',
      parentLevelName: undefined,
      type: 'Weblab2',
    },
  }),
}));
jest.mock('@cdo/apps/aiDifferentiation/AiDiffFloatingActionButton', () => ({
  __esModule: true,
  default: () => <div>AI TA drawer</div>,
}));

const rubric = {id: 7, learningGoals: [], level: {name: 'rubric-level'}};

const createStore = ({labLoading = false} = {}) =>
  configureStore({
    reducer: {
      aiDiffChat: aiDiffChatReducer,
      currentUser: () => ({isTeacher: true}),
      lab: () => ({
        isLoadingProjectOrLevel: false,
        isLoading: labLoading,
        isLoadingTheme: false,
      }),
      progress: () => ({
        viewAsUserId: null,
        courseName: 'csd-2026',
        scriptName: 'csd2-2026',
      }),
      teacherPanel: () => ({levelsWithProgress: []}),
      teacherSections: () => ({selectedStudents: []}),
    },
  });

const renderContainer = (store = createStore()) => {
  const result = render(
    <Provider store={store}>
      <RubricFABContainer />
    </Provider>
  );
  return {store, ...result};
};

describe('RubricFABContainer', () => {
  beforeEach(() => {
    jest
      .spyOn(experiments, 'isEnabled')
      .mockImplementation(name => name === 'rubrics-drawer');
    jest.mocked(useRubric).mockReturnValue({
      showRubric: true,
      isLoading: false,
      rubricData: {rubric, canShowTaScoresAlert: false},
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('publishes the level rubric to the TA drawer', () => {
    const {store} = renderContainer();

    expect(store.getState().aiDiffChat.drawerRubric).toEqual({
      rubric,
      studentLevelInfo: undefined,
      levelName: 'rubric-level',
      parentLevelName: undefined,
      levelType: 'Weblab2',
      unitName: 'csd2-2026',
      courseName: 'csd-2026',
    });
  });

  it('publishes the rubric before the lab finishes loading', () => {
    const {store, queryByText} = renderContainer(
      createStore({labLoading: true})
    );

    expect(store.getState().aiDiffChat.drawerRubric).not.toBeNull();
    expect(queryByText('AI TA drawer')).toBeNull();
  });

  it('withdraws the rubric when the level does not show one', () => {
    const {store, rerender} = renderContainer();
    jest.mocked(useRubric).mockReturnValue({
      showRubric: false,
      isLoading: false,
      rubricData: {rubric, canShowTaScoresAlert: false},
    });

    rerender(
      <Provider store={store}>
        <RubricFABContainer />
      </Provider>
    );

    expect(store.getState().aiDiffChat.drawerRubric).toBeNull();
  });

  it('withdraws the rubric on unmount', () => {
    const {store, unmount} = renderContainer();

    unmount();

    expect(store.getState().aiDiffChat.drawerRubric).toBeNull();
  });

  it('mounts its own drawer when Lab2 hosts none', () => {
    const {getByText} = renderContainer();

    expect(getByText('AI TA drawer')).toBeInTheDocument();
  });

  it('defers to the drawer Lab2 already hosts', () => {
    const store = createStore();
    store.dispatch(
      setHostedDrawerConfig({context: {type: AiDiffContext.LEVEL}})
    );

    const {queryByText} = renderContainer(store);

    expect(queryByText('AI TA drawer')).toBeNull();
    expect(store.getState().aiDiffChat.drawerRubric).not.toBeNull();
  });
});
