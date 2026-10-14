import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import SimpleHeader, {
  currentHeaderLabel,
} from '@cdo/apps/code-studio/components/header/SimpleHeader';
import {ProjectState} from '@cdo/apps/code-studio/projectRedux';

import styles from '@cdo/apps/code-studio/components/header/simple-header.module.scss';

let levels: unknown[] = [];
jest.mock('@cdo/apps/code-studio/progressReduxSelectors', () => ({
  getCurrentLevels: () => levels,
}));
// Connected to stores of their own; stubbed to what the row places.
jest.mock('@cdo/apps/code-studio/components/header/ProjectInfo', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@cdo/apps/code-studio/components/header/ProjectUpdatedAt', () => ({
  __esModule: true,
  default: () => require('react').createElement('span', null, 'Saved'),
}));

interface StoreState {
  isRtl: boolean;
  project?: Partial<ProjectState>;
}

function renderHeader(state: Partial<StoreState> = {}) {
  const store = createStore(() => ({isRtl: false, ...state}));
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
    levels = [
      {id: '1', headerLabel: 'Story', isCurrentLevel: true},
      {id: '2', headerLabel: 'Story'},
    ];
  });

  it('places the image, the name and label, and the buttons', () => {
    renderHeader();
    const row = document.querySelector('#header_middle_content') as HTMLElement;
    expect(row.classList.contains(styles.row)).toBe(true);
    expect(row.querySelector('img')?.getAttribute('src')).toBe('/logo.png');
    const name = document.querySelector('#unit_name_container') as HTMLElement;
    expect(name.getAttribute('href')).toBe('/s/hoai2026-dev');
    expect(name.textContent).toBe('hoai2026 dev');
    expect(screen.getByText('Story')).toBeTruthy();
    expect(
      document
        .querySelector('#project_info_container')
        ?.classList.contains(styles.projectInfo)
    ).toBe(true);
  });

  it('shows the name alone when the current level has no label', () => {
    levels = [{id: '1', isCurrentLevel: true}];
    renderHeader();
    expect(screen.queryByText('·')).toBeNull();
    expect(document.querySelector('#unit_name_container')).not.toBeNull();
  });

  it('shows the saved-at only once the project store asks for it', () => {
    renderHeader();
    expect(screen.queryByText('Saved')).toBeNull();
    renderHeader({project: {showProjectUpdatedAt: true}});
    expect(screen.getByText('Saved')).toBeTruthy();
  });

  it('marks the document as carrying the header', () => {
    delete document.documentElement.dataset.headerPresent;
    renderHeader();
    expect(document.documentElement.dataset.headerPresent).toBe('true');
  });
});

describe('currentHeaderLabel', () => {
  it("reads the current level's label, through a current sublevel", () => {
    expect(
      currentHeaderLabel([
        {headerLabel: 'A'},
        {headerLabel: 'B', sublevels: [{isCurrentLevel: true}]},
      ])
    ).toBe('B');
    expect(currentHeaderLabel([{isCurrentLevel: true}])).toBeNull();
    expect(currentHeaderLabel(undefined)).toBeNull();
  });
});
