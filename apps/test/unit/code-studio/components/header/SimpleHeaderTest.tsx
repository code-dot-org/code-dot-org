import {act, render} from '@testing-library/react';
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

function renderHeader(
  header: {appLoadStarted?: boolean; appLoaded?: boolean} = {}
) {
  const store = createStore(() => ({header, isRtl: false}));
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
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('waits for an app load to begin, then shows without one', () => {
    renderHeader();
    expect(document.querySelector('#header_middle_content')).toBeNull();
    act(() => {
      jest.advanceTimersByTime(750);
    });
    expect(document.querySelector('#header_middle_content')).not.toBeNull();
  });

  it('shows at once when an app load has begun and ended', () => {
    renderHeader({appLoadStarted: true, appLoaded: true});
    expect(document.querySelector('#header_middle_content')).not.toBeNull();
  });

  it('holds while an app load is under way', () => {
    renderHeader({appLoadStarted: true});
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(document.querySelector('#header_middle_content')).toBeNull();
  });

  it('places each part of the row under its class', () => {
    renderHeader({appLoadStarted: true, appLoaded: true});
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
