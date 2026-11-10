import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';

import SimpleHeader, {
  HEADER_ACTION_ID,
} from '@cdo/apps/code-studio/components/header/SimpleHeader';
import projectReducer, {ProjectState} from '@cdo/apps/code-studio/projectRedux';

import styles from '@cdo/apps/code-studio/components/header/simple-header.module.scss';

let levels:
  | {
      id: string;
      status?: string;
      levelNumber: number;
      isCurrentLevel?: boolean;
      sublevels?: {isCurrentLevel?: boolean}[];
    }[]
  | undefined = [];
jest.mock('@cdo/apps/code-studio/progressReduxSelectors', () => ({
  getCurrentLevels: () => levels,
}));
// Connected to a store of its own; stubbed to what the row places.
jest.mock('@cdo/apps/code-studio/components/header/ProjectInfo', () => ({
  __esModule: true,
  default: () => null,
}));

function renderHeader(
  project: Partial<ProjectState> = {},
  props: Partial<React.ComponentProps<typeof SimpleHeader>> = {}
) {
  const reducer = combineReducers({
    isRtl: () => false,
    project: projectReducer,
  });
  const store = createStore(reducer, {
    isRtl: false,
    project: {...projectReducer(undefined, {type: ''}), ...project},
  });
  return render(
    <Provider store={store}>
      <SimpleHeader lessonName="Make a quest" {...props} />
    </Provider>
  );
}

describe('SimpleHeader', () => {
  beforeEach(() => {
    levels = [
      {id: '1', status: 'perfect', levelNumber: 1},
      {id: '2', status: 'attempted', levelNumber: 2, isCurrentLevel: true},
      {id: '3', levelNumber: 3},
    ];
  });

  it('places the lesson name, the bubbles and the buttons', () => {
    renderHeader();
    const row = document.querySelector('#header_middle_content') as HTMLElement;
    expect(row.classList.contains(styles.row)).toBe(true);
    expect(screen.getByText('Make a quest').getAttribute('title')).toBe(
      'Make a quest'
    );
    expect(
      document
        .querySelector('#project_info_container')
        ?.classList.contains(styles.projectInfo)
    ).toBe(true);
  });

  it('draws a bubble per level with its status, the current one marked, none of them a link', () => {
    renderHeader();
    const group = screen.getByRole('group', {name: 'Lesson progress'});
    const bubbles = group.querySelectorAll('[role=img]');
    expect([...bubbles].map(b => b.getAttribute('aria-label'))).toEqual([
      'Level 1, completed',
      'Level 2, in progress',
      'Level 3, not started',
    ]);
    expect(bubbles[1].getAttribute('aria-current')).toBe('step');
    expect(bubbles[1].textContent).toBe('2');
    expect(group.querySelectorAll('a, button')).toHaveLength(0);
  });

  it('marks a level current when one of its sublevels is', () => {
    levels = [
      {id: '1', levelNumber: 1, sublevels: [{isCurrentLevel: true}]},
      {id: '2', levelNumber: 2},
    ];
    renderHeader();
    const bubbles = screen
      .getByRole('group', {name: 'Lesson progress'})
      .querySelectorAll('[role=img]');
    expect(bubbles[0].getAttribute('aria-current')).toBe('step');
    expect(bubbles[1].getAttribute('aria-current')).toBeNull();
  });

  it('draws no bubbles until the lesson is known', () => {
    levels = undefined;
    renderHeader();
    expect(
      screen.getByRole('group', {name: 'Lesson progress'}).childElementCount
    ).toBe(0);
  });

  it('shows the save status once the project store asks', () => {
    renderHeader();
    expect(screen.queryByRole('img', {name: /Saved|Saving|saved/})).toBeNull();
    renderHeader({showProjectUpdatedAt: true, projectUpdatedStatus: 'saving'});
    expect(screen.getByRole('img', {name: 'Saving'})).toBeTruthy();
  });

  it('announces a failed save', () => {
    renderHeader({showProjectUpdatedAt: true, projectUpdatedStatus: 'error'});
    expect(screen.getByRole('img', {name: 'Save failed'})).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('Save failed');
  });

  it('shows no save status for a project not saved yet', () => {
    renderHeader({showProjectUpdatedAt: true, projectUpdatedStatus: 'default'});
    expect(screen.queryByRole('img', {name: 'Not saved'})).toBeNull();
  });

  it('shows the lesson name as text, with no lesson menu', () => {
    renderHeader();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('leaves a slot for the lab to fill', () => {
    renderHeader();
    const slot = document.getElementById(HEADER_ACTION_ID) as HTMLElement;
    expect(slot).toBeTruthy();
    expect(slot.childElementCount).toBe(0);
  });

  it('marks the document as carrying the header', () => {
    delete document.documentElement.dataset.headerPresent;
    renderHeader();
    expect(document.documentElement.dataset.headerPresent).toBe('true');
  });
});
