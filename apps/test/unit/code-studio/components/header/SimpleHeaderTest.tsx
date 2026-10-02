import {act, render} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import SimpleHeader from '@cdo/apps/code-studio/components/header/SimpleHeader';

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

  it('centres a flex row whose parts may each shrink', () => {
    renderHeader({appLoadStarted: true, appLoaded: true});
    const row = document.querySelector('#header_middle_content') as HTMLElement;
    expect(row.style.display).toBe('flex');
    expect(row.style.justifyContent).toBe('center');
    for (const id of [
      'project_info_container',
      'unit_name_container',
      'simple_progress_container',
    ]) {
      const part = document.querySelector(`#${id}`) as HTMLElement;
      expect(part.style.minWidth).toBe('0');
      expect(part.style.flexShrink).toBe('1');
    }
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
