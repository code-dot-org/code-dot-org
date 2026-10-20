import {render} from '@testing-library/react';
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
jest.mock('@cdo/apps/code-studio/components/header/ScriptName', () => ({
  __esModule: true,
  default: (props: {name: string; href: string}) =>
    require('react').createElement('a', {href: props.href}, props.name),
}));

function renderHeader(header?: object) {
  const store = createStore(() => ({isRtl: false, header}));
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

  it('places each part of the row under its class', () => {
    renderHeader();
    const has = (id: string, className: string) =>
      (document.querySelector(`#${id}`) as HTMLElement).classList.contains(
        className
      );
    expect(has('header_middle_content', styles.row)).toBe(true);
    expect(has('project_info_container', styles.projectInfo)).toBe(true);
    expect(has('unit_name_container', styles.unitName)).toBe(true);
    expect(has('simple_progress_container', styles.progress)).toBe(true);
    expect(document.querySelector('#simple_progress_label')?.textContent).toBe(
      'Story'
    );
    expect(
      document.querySelector('a[href="/s/hoai2026-dev"]')?.textContent
    ).toBe('hoai2026 dev');
  });

  it("shows a lab's name beside the logo, over its bar, with no unit name", () => {
    renderHeader({
      simpleHeaderOverride: {
        name: 'Basics',
        progress: {position: 1, total: 2, valueText: 'Step 1 of 2'},
      },
    });
    expect(document.querySelector('#unit_name_container')).toBeNull();
    expect(document.querySelector('#simple_progress_label')?.textContent).toBe(
      'Basics'
    );
    const bar = document.querySelector('[role="progressbar"]')!;
    expect(bar.getAttribute('aria-labelledby')).toBe('simple_progress_label');
    expect(bar.getAttribute('aria-valuetext')).toBe('Step 1 of 2');
  });

  it("shows a lab's name with no bar when it gives no progress", () => {
    renderHeader({simpleHeaderOverride: {name: 'Skill map'}});
    expect(document.querySelector('#unit_name_container')).toBeNull();
    expect(document.querySelector('#simple_progress_label')?.textContent).toBe(
      'Skill map'
    );
    expect(document.querySelector('[role="progressbar"]')).toBeNull();
  });

  it('places an empty slot for lab controls at the start of the row', () => {
    renderHeader();
    const row = document.querySelector('#header_middle_content')!;
    expect(row.firstElementChild?.id).toBe('header_lab_controls');
    expect(row.firstElementChild?.childElementCount).toBe(0);
  });

  it('marks the document as carrying the header', () => {
    delete document.documentElement.dataset.headerPresent;
    renderHeader();
    expect(document.documentElement.dataset.headerPresent).toBe('true');
  });
});
