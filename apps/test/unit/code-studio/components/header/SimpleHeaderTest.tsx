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

function renderHeader() {
  const store = createStore(() => ({isRtl: false}));
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

  it('marks the document as carrying the header', () => {
    delete document.documentElement.dataset.headerPresent;
    renderHeader();
    expect(document.documentElement.dataset.headerPresent).toBe('true');
  });
});
