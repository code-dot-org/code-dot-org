import {act, fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import AdaptiveHeader from '@cdo/apps/adaptive/views/AdaptiveHeader';
import {ADAPTIVE_HEADER_ID} from '@cdo/apps/code-studio/components/header/AdaptiveHeaderPortal';
import {ProjectState} from '@cdo/apps/code-studio/projectRedux';

function addSlot() {
  const slot = document.createElement('div');
  slot.id = ADAPTIVE_HEADER_ID;
  document.body.appendChild(slot);
  return slot;
}

function renderHeader(
  props: Partial<React.ComponentProps<typeof AdaptiveHeader>> = {},
  status: ProjectState['projectUpdatedStatus'] = 'default'
) {
  const store = createStore(() => ({project: {projectUpdatedStatus: status}}));
  return render(
    <Provider store={store}>
      <AdaptiveHeader title="Skill Tree: Build a website" {...props} />
    </Provider>
  );
}

describe('AdaptiveHeader', () => {
  afterEach(() => document.getElementById(ADAPTIVE_HEADER_ID)?.remove());

  it("draws into the page header's slot when there is one", () => {
    const slot = addSlot();
    const {container} = renderHeader();
    expect(slot.textContent).toContain('Skill Tree: Build a website');
    expect(container.textContent).toBe('');
  });

  it('draws inline until the slot appears, then moves into it', async () => {
    const {container} = renderHeader();
    expect(container.textContent).toContain('Skill Tree: Build a website');

    let slot!: HTMLElement;
    // The observer reports in a microtask after the mutation.
    await act(async () => {
      slot = addSlot();
      await Promise.resolve();
    });
    expect(slot.textContent).toContain('Skill Tree: Build a website');
    expect(container.textContent).toBe('');
  });

  it('offers only the buttons it is given handlers for', () => {
    renderHeader();
    expect(screen.queryByRole('button', {name: /View skill tree/})).toBeNull();
    expect(screen.queryByRole('button', {name: /I'm finished!/})).toBeNull();
  });

  it('calls its handlers from its buttons', () => {
    const onViewSkillTree = jest.fn();
    const onFinish = jest.fn();
    renderHeader({onViewSkillTree, onFinish});

    fireEvent.click(screen.getByRole('button', {name: /View skill tree/}));
    expect(onViewSkillTree).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', {name: /I'm finished!/}));
    expect(onFinish).toHaveBeenCalled();
  });

  it("names the project's save state on the cloud", () => {
    renderHeader({}, 'saved');
    expect(screen.getByTitle('Saved')).toBeTruthy();
  });
});
