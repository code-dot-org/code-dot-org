import {render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import SimpleHeader from '@cdo/apps/code-studio/components/header/SimpleHeader';

import styles from '@cdo/apps/code-studio/components/header/simple-header.module.scss';

jest.mock('@cdo/apps/code-studio/progressReduxSelectors', () => ({
  getCurrentLevels: () => [
    {id: '1', headerLabel: 'Story', isCurrentLevel: true},
    {id: '2', headerLabel: 'Story'},
  ],
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
  project?: {showProjectUpdatedAt: boolean};
  simpleProgress?: {
    progress: {label: string; position: number; total: number} | null;
  };
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
  it('shows on mount', () => {
    renderHeader();
    expect(document.querySelector('#header_middle_content')).not.toBeNull();
  });

  it('places the image, the name and label, the bar and the buttons', () => {
    renderHeader();
    const row = document.querySelector('#header_middle_content') as HTMLElement;
    expect(row.classList.contains(styles.row)).toBe(true);
    expect(row.querySelector('img')?.getAttribute('src')).toBe('/logo.png');
    const name = document.querySelector('#unit_name_container') as HTMLElement;
    expect(name.getAttribute('href')).toBe('/s/hoai2026-dev');
    expect(name.textContent).toBe('hoai2026 dev');
    expect(document.querySelector('#simple_progress_label')?.textContent).toBe(
      'Story'
    );
    expect(screen.getByRole('progressbar').getAttribute('aria-valuetext')).toBe(
      'Level 1 of 2'
    );
    expect(
      document
        .querySelector('#project_info_container')
        ?.classList.contains(styles.projectInfo)
    ).toBe(true);
  });

  it('shows the saved-at only once the project store asks for it', () => {
    renderHeader();
    expect(screen.queryByText('Saved')).toBeNull();
    renderHeader({project: {showProjectUpdatedAt: true}});
    expect(screen.getByText('Saved')).toBeTruthy();
  });

  it('prefers progress reported to the store over the levels', () => {
    renderHeader({
      simpleProgress: {
        progress: {label: 'Introduction', position: 2, total: 4},
      },
    });
    expect(document.querySelector('#simple_progress_label')?.textContent).toBe(
      'Introduction'
    );
    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('2');
    expect((bar.firstChild as HTMLElement).style.width).toBe('50%');
  });

  it('marks the document as carrying the header', () => {
    delete document.documentElement.dataset.headerPresent;
    renderHeader();
    expect(document.documentElement.dataset.headerPresent).toBe('true');
  });
});
