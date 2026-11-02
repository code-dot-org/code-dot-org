import React, {act} from 'react';

import {
  createReactRoot,
  unmountReactRoot,
} from '@cdo/apps/util/createReactRoot';

describe('unmountReactRoot', () => {
  let container: HTMLDivElement;

  beforeAll(() => {
    (
      globalThis as {IS_REACT_ACT_ENVIRONMENT?: boolean}
    ).IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('unmounts a createRoot tree', () => {
    act(() => createReactRoot(<span>hello</span>, container));
    expect(container.textContent).toBe('hello');

    act(() => unmountReactRoot(container));
    expect(container.textContent).toBe('');
  });

  it('unmounts a legacy tree', () => {
    act(() =>
      createReactRoot(<span>hello</span>, container, {
        legacyReactDomRender: true,
      })
    );
    expect(container.textContent).toBe('hello');

    act(() => unmountReactRoot(container));
    expect(container.textContent).toBe('');
  });

  it('allows rendering again after unmount', () => {
    act(() => createReactRoot(<span>one</span>, container));
    act(() => unmountReactRoot(container));
    act(() => createReactRoot(<span>two</span>, container));
    expect(container.textContent).toBe('two');
  });
});
