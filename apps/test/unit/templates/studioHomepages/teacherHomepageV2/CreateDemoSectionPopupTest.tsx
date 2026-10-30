import {fireEvent, render, screen, act} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';

import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';
import {CreateDemoSectionPopup} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/CreateDemoSectionPopup';
import teacherSections, {
  setDemoPresets,
  setDemoPresetsLoaded,
  startDemoSectionCreation,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {
  DemoPresetView,
  DemoType,
} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
// Spy on HttpClient methods directly rather than jest.mock()-ing the module,
// which would auto-mock NetworkError and break the `instanceof` checks in
// createDemoSection's error handling.
import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';

const ELEMENTARY_PRESET: DemoPresetView = {
  demoType: 'elementary',
  sectionName: 'Elementary School Practice Section',
  avatarColor: 1,
  avatarEmoji: 2,
  loginType: 'picture',
  participantType: 'student',
  grades: ['2'],
  unit: {name: 'coursea-2024', displayName: 'Course A'},
  unitGroup: null,
  studentSnapshotDefaultTourLesson: null,
  reviewSyllabusQuizLesson: null,
  reviewSyllabusQuizOptions: null,
};

const HIGH_PRESET: DemoPresetView = {
  demoType: 'high',
  sectionName: 'High School Practice Section',
  avatarColor: 8,
  avatarEmoji: 5,
  loginType: 'email',
  participantType: 'student',
  grades: ['9', '10', '11', '12'],
  unit: {name: 'aif2-2025', displayName: 'Artificial Intelligence Foundations'},
  unitGroup: {
    name: 'artificial-intelligence-foundations-2025',
    displayName: 'Artificial Intelligence Foundations',
  },
  studentSnapshotDefaultTourLesson: null,
  reviewSyllabusQuizLesson: null,
  reviewSyllabusQuizOptions: null,
};

describe('CreateDemoSectionPopup', () => {
  let fetchSpy: jest.SpyInstance;
  let postSpy: jest.SpyInstance;
  let onClose: jest.Mock;

  beforeEach(() => {
    onClose = jest.fn();
    fetchSpy = jest.spyOn(HttpClient, 'fetchJson');
    postSpy = jest.spyOn(HttpClient, 'post');
    fetchSpy.mockResolvedValue({value: {}, response: new Response()});
    postSpy.mockResolvedValue({json: () => Promise.resolve({})});
    stubRedux();
    registerReducers({teacherSections});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    restoreRedux();
  });

  // Seeds presets straight into the store and marks them loaded so the mount
  // effect's fetchDemoPresets() short-circuits without hitting the network.
  function renderWithPresets(
    presets: Partial<Record<DemoType, DemoPresetView>> = {
      elementary: ELEMENTARY_PRESET,
      high: HIGH_PRESET,
    }
  ) {
    const store = getStore();
    store.dispatch(setDemoPresets(presets));
    store.dispatch(setDemoPresetsLoaded(true));
    const result = render(
      <Provider store={store}>
        <CreateDemoSectionPopup onClose={onClose} />
      </Provider>
    );
    return {store, ...result};
  }

  async function flush() {
    await act(async () => await new Promise(process.nextTick));
  }

  it('renders the heading inside a dialog', () => {
    renderWithPresets();
    screen.getByRole('dialog', {
      name: 'Pick the grade for your practice class',
    });
    screen.getByRole('heading', {
      name: 'Pick the grade for your practice class',
    });
  });

  it('renders one option per preset with title, grades, curriculum, and login type', () => {
    renderWithPresets();

    screen.getByText('Elementary School');
    screen.getByText('Grade 2');
    screen.getByText('Curriculum: Course A');
    screen.getByText('Login type: Picture logins');

    screen.getByText('High School');
    screen.getByText('Grades 9–12');
    screen.getByText('Curriculum: Artificial Intelligence Foundations');
    screen.getByText('Login type: Personal logins');
  });

  it('orders options elementary, middle, high regardless of preset insertion order', () => {
    renderWithPresets({high: HIGH_PRESET, elementary: ELEMENTARY_PRESET});

    const titles = screen
      .getAllByRole('button')
      .map(button => button.textContent);
    expect(titles[0]).toContain('Elementary School');
    expect(titles[1]).toContain('High School');
  });

  it('fetches demo presets on mount when not already loaded', async () => {
    const store = getStore();
    render(
      <Provider store={store}>
        <CreateDemoSectionPopup onClose={onClose} />
      </Provider>
    );
    await flush();

    expect(fetchSpy).toHaveBeenCalledWith('/api/v1/sections/demo/presets');
  });

  it('creates the section and closes when an option is clicked', async () => {
    postSpy.mockResolvedValue({
      json: () =>
        Promise.resolve({
          id: 21,
          name: 'High School Practice Section',
          login_type: 'email',
          hidden: false,
        }),
    });
    renderWithPresets();

    fireEvent.click(screen.getByText('High School'));
    await flush();

    expect(postSpy).toHaveBeenCalledWith(
      '/api/v1/sections/demo/create/high',
      undefined,
      true
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows the conflict error message and does not close when creation 409s', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    postSpy.mockRejectedValue(
      new NetworkError('conflict', new Response(null, {status: 409}))
    );
    renderWithPresets();

    fireEvent.click(screen.getByText('High School'));
    await flush();

    const alert = screen.getByRole('alert');
    expect(alert.textContent).toBe(
      'You already have a High School practice section.'
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows a generic error message for non-conflict failures', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    postSpy.mockRejectedValue(new Error('boom'));
    renderWithPresets();

    fireEvent.click(screen.getByText('Elementary School'));
    await flush();

    const alert = screen.getByRole('alert');
    expect(alert.textContent).toBe("Couldn't create your practice section.");
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows a progress bar and disables options while creation is in progress', () => {
    const {store} = renderWithPresets();
    act(() => {
      store.dispatch(startDemoSectionCreation());
    });

    screen.getByRole('progressbar', {name: 'Creating your practice section'});
    [/Elementary School/, /High School/].forEach(name =>
      expect(
        (screen.getByRole('button', {name}) as HTMLButtonElement).disabled
      ).toBe(true)
    );
  });

  it('closes when a mousedown lands outside the dialog', () => {
    renderWithPresets();

    fireEvent.mouseDown(document.body);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on an outside mousedown while creation is in progress', () => {
    const {store} = renderWithPresets();
    act(() => {
      store.dispatch(startDemoSectionCreation());
    });

    fireEvent.mouseDown(document.body);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not close on a mousedown inside the dialog', () => {
    renderWithPresets();

    fireEvent.mouseDown(screen.getByRole('dialog'));

    expect(onClose).not.toHaveBeenCalled();
  });
});
