import '@testing-library/jest-dom';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {MemoryRouter} from 'react-router-dom';

import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import DemoSectionCard from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/DemoSectionCard';
import * as teacherSectionsRedux from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {DemoPresetView} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';

const navigateMock = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => navigateMock,
}));

describe('DemoSectionCard', () => {
  const store = getStore();
  const preset: DemoPresetView = {
    demoType: 'high',
    sectionName: 'High School Practice Section',
    avatarColor: 8,
    avatarEmoji: 5,
    loginType: 'email',
    participantType: 'student',
    unit: {
      name: 'aif2-2025',
      displayName: 'Artificial Intelligence Foundations',
    },
    unitGroup: {
      name: 'artificial-intelligence-foundations-2025',
      displayName: 'Artificial Intelligence Foundations',
    },
  };

  beforeEach(() => {
    jest.spyOn(analyticsReporter, 'sendEvent').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    navigateMock.mockReset();
  });

  function renderComponent(onNotice = jest.fn()) {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <DemoSectionCard
            demoType="high"
            onDeleteClickCallback={jest.fn()}
            onNotice={onNotice}
            preset={preset}
          />
        </MemoryRouter>
      </Provider>
    );
  }

  it('renders the preset-driven preview data', () => {
    renderComponent();

    expect(
      screen.getByText('High School Practice Section')
    ).toBeInTheDocument();
    expect(screen.getByText(/DEMO-123/)).toBeInTheDocument();
    expect(screen.getByText('Demo')).toBeInTheDocument();
    expect(
      screen.getAllByText('Artificial Intelligence Foundations')[0]
    ).toBeInTheDocument();
    expect(screen.getByText('Section settings')).toBeInTheDocument();
    expect(screen.getByText('Roster')).toBeInTheDocument();
    expect(screen.getByText('Login cards')).toBeInTheDocument();
    expect(screen.getByText('Certificates')).toBeInTheDocument();
    expect(screen.getByText('Archive')).toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('creates the demo section and navigates to the chosen destination', async () => {
    jest
      .spyOn(teacherSectionsRedux, 'createDemoSection')
      .mockReturnValue((() => Promise.resolve({id: 42})) as never);

    renderComponent();
    fireEvent.click(screen.getByText('View progress'));

    await waitFor(() => {
      expect(teacherSectionsRedux.createDemoSection).toHaveBeenCalledWith(
        'high'
      );
      expect(navigateMock).toHaveBeenCalledWith('/sections/42/progress');
    });
  });

  it('creates the demo section from a course-content destination', async () => {
    jest
      .spyOn(teacherSectionsRedux, 'createDemoSection')
      .mockReturnValue((() => Promise.resolve({id: 42})) as never);

    renderComponent();
    fireEvent.click(screen.getByText('Jump to'));
    fireEvent.click(screen.getByText('Go to unit'));

    await waitFor(() => {
      expect(teacherSectionsRedux.createDemoSection).toHaveBeenCalledWith(
        'high'
      );
      expect(navigateMock).toHaveBeenCalledWith('/sections/42/unit/aif2-2025');
    });
  });

  it('creates the demo section from the section options menu', async () => {
    jest
      .spyOn(teacherSectionsRedux, 'createDemoSection')
      .mockReturnValue((() => Promise.resolve({id: 42})) as never);

    renderComponent();
    fireEvent.click(screen.getByText('Section settings'));

    await waitFor(() => {
      expect(teacherSectionsRedux.createDemoSection).toHaveBeenCalledWith(
        'high'
      );
      expect(navigateMock).toHaveBeenCalledWith('/sections/42/settings');
    });
  });

  it('surfaces conflict failures on the homepage notice channel', async () => {
    const onNotice = jest.fn();
    jest
      .spyOn(teacherSectionsRedux, 'createDemoSection')
      .mockReturnValue((() =>
        Promise.reject(
          new teacherSectionsRedux.DemoSectionCreationError(
            'conflict',
            'You already have a practice section.'
          )
        )) as never);

    renderComponent(onNotice);
    fireEvent.click(screen.getByText('View progress'));

    await waitFor(() => {
      expect(onNotice).toHaveBeenCalledWith({
        text: 'You already have a practice section.',
        type: 'warning',
      });
    });
  });
});
