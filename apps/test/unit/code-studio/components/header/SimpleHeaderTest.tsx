import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';

import SimpleHeader from '@cdo/apps/code-studio/components/header/SimpleHeader';
import projectReducer, {ProjectState} from '@cdo/apps/code-studio/projectRedux';

import styles from '@cdo/apps/code-studio/components/header/simple-header.module.scss';

let current: {headerLabel?: string} | undefined;
let parent: {headerLabel?: string} | undefined;
jest.mock('@cdo/apps/code-studio/progressReduxSelectors', () => ({
  getCurrentLevel: () => current,
  getParentLevel: () => parent,
}));
// Connected to stores of their own; stubbed to what the row places.
jest.mock('@cdo/apps/code-studio/components/header/ProjectInfo', () => ({
  __esModule: true,
  default: () => null,
}));
// The real module's constants size the slot; only the saved-at itself is
// stubbed.
jest.mock('@cdo/apps/code-studio/components/header/ProjectUpdatedAt', () => ({
  __esModule: true,
  ...jest.requireActual(
    '@cdo/apps/code-studio/components/header/ProjectUpdatedAt'
  ),
  default: () => require('react').createElement('span', null, 'Saved'),
}));

function renderHeader(project: Partial<ProjectState> = {}) {
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
      <SimpleHeader
        scriptData={{simpleProgressImage: '/logo.png'}}
        scriptNameData={{name: 'hoai2026 dev', href: '/s/hoai2026-dev'}}
      />
    </Provider>
  );
}

describe('SimpleHeader', () => {
  beforeEach(() => {
    current = {headerLabel: 'Story'};
    parent = undefined;
  });

  it('places the image, the name and label, and the buttons', () => {
    renderHeader();
    const row = document.querySelector('#header_middle_content') as HTMLElement;
    expect(row.classList.contains(styles.row)).toBe(true);
    expect(row.querySelector('img')?.getAttribute('src')).toBe('/logo.png');
    const name = document.querySelector('#unit_name_container') as HTMLElement;
    expect(name.getAttribute('href')).toBe('/s/hoai2026-dev');
    expect(name.textContent).toBe('hoai2026 dev');
    expect(screen.getByText('Story').getAttribute('title')).toBe('Story');
    expect(
      document
        .querySelector('#project_info_container')
        ?.classList.contains(styles.projectInfo)
    ).toBe(true);
  });

  it("reads a current sublevel's label from its parent", () => {
    current = {};
    parent = {headerLabel: 'Parent'};
    renderHeader();
    expect(screen.getByText('Parent')).toBeTruthy();
  });

  it('shows the name alone when the current level has no label', () => {
    current = {};
    renderHeader();
    expect(screen.queryByText('·')).toBeNull();
    expect(document.querySelector('#unit_name_container')).not.toBeNull();
  });

  it('reserves the saved-at slot, and fills it once the project store asks', () => {
    renderHeader();
    expect(screen.queryByText('Saved')).toBeNull();
    const slot = document.querySelector('#unit_name_container')?.parentElement
      ?.nextElementSibling as HTMLElement;
    expect(slot.style.height).toBe('14px');
    renderHeader({showProjectUpdatedAt: true});
    expect(screen.getByText('Saved')).toBeTruthy();
  });

  it('marks the document as carrying the header', () => {
    delete document.documentElement.dataset.headerPresent;
    renderHeader();
    expect(document.documentElement.dataset.headerPresent).toBe('true');
  });
});
