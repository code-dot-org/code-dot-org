import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {Provider} from 'react-redux';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import {
  REQUIRED_ERROR,
  WorkshopForm,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshop_form/WorkshopForm';
import {workshopLabel} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/utils';
import {WorkshopCourseConfigs} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import {useFetch} from '@cdo/apps/util/useFetch';

jest.mock('@cdo/apps/util/useFetch');

const mockedUseFetch = useFetch;

// mock redux store
const initialState = {
  mapbox: {mapboxAccessToken: 'test-token'},
};

describe('WorkshopForm', () => {
  const testConfigs = WorkshopCourseConfigs.map(config => [
    config.label,
    config,
  ]);
  let user;
  let store;
  let mockGetState;

  const renderDefault = (props = {}, path = '/') =>
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/" element={<WorkshopForm {...props} />} />
            <Route path="/:workshopId" element={<WorkshopForm {...props} />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

  beforeEach(() => {
    jest.resetAllMocks();
    user = userEvent.setup();
    mockGetState = jest.fn().mockReturnValue(initialState);
    store = {
      getState: mockGetState,
      subscribe: () => {},
    };
    mockedUseFetch.mockImplementation(url => {
      if (url.includes('/api/v1/regional_partners')) {
        return {
          data: [{id: 1, name: 'Bill Smith'}],
          loading: false,
          error: null,
        };
      }
      return {data: null, loading: false, error: null};
    });
  });

  it.each(testConfigs)('renders the form for %s', (_, config) => {
    renderDefault({config});

    expect(
      screen.getByText(workshopLabel(`New ${config.label}`))
    ).toBeInTheDocument();
    expect(screen.getByText('Workshop Basics')).toBeInTheDocument();
    expect(screen.getByText('Schedule')).toBeInTheDocument();
    expect(screen.getByText('Publish Settings')).toBeInTheDocument();
    expect(screen.getByText('Publish')).toBeInTheDocument();
    expect(screen.getByText('Cancel and exit')).toBeInTheDocument();
  });

  it.each(testConfigs)(
    'renders field labels and helper messages for %s',
    async (_, config) => {
      renderDefault({config});

      await user.selectOptions(
        screen.getByRole('combobox', {
          name: `${config.fields.prereq.label} ${config.fields.prereq.helperMessage}`,
        }),
        'true'
      );

      Object.values(config.fields).forEach(field => {
        // organizerId is not in form on create, only edit
        if (field.stateKey !== 'organizerId') {
          expect(screen.getByText(field.label)).toBeInTheDocument();
          if (field.helperMessage) {
            expect(screen.getByText(field.helperMessage)).toBeInTheDocument();
          }
        }
      });
    }
  );

  it.each(testConfigs)(
    'pre-fills regional partner if there is one option for %s',
    async (_, config) => {
      renderDefault({
        config,
      });

      const input = screen.getByLabelText(
        config.fields.regional_partner_id.label
      );
      // SimpleDropdown values can only be strings
      expect(input.value).toBe('1');
    }
  );

  it.each(testConfigs)(
    'does not pre-fill regional partner if there is more than one option for %s',
    async (_, config) => {
      mockedUseFetch.mockImplementation(url => {
        if (url.includes('/api/v1/regional_partners')) {
          return {
            data: [
              {id: 1, name: 'Bill Smith'},
              {id: 2, name: 'Jane Yates'},
            ],
            loading: false,
            error: null,
          };
        }
        return {data: null, loading: false, error: null};
      });
      renderDefault({
        config,
      });

      const input = screen.getByLabelText(
        config.fields.regional_partner_id.label
      );
      // SimpleDropdown values can only be strings
      expect(input.value).toBe('');
    }
  );

  it.each(testConfigs)(
    'displays required validation errors for %s',
    async (_, config) => {
      renderDefault({config});

      const publishButton = screen.getByRole('button', {name: 'Publish'});
      await user.click(publishButton);

      expect(
        screen.getByText(
          'Your form contains validation errors that must be corrected'
        )
      ).toBeInTheDocument();

      Object.values(config.fields).forEach(field => {
        // organizerId is not in form on create, only edit
        if (field.stateKey !== 'organizerId') {
          expect(screen.getByText(field.label)).toBeInTheDocument();
        }
        if (field.required) {
          if (field.helperMessage) {
            expect(
              screen.queryByText(field.helperMessage)
            ).not.toBeInTheDocument();
          }
        }
      });

      const expectedErrorLength = Object.values(config.fields).filter(
        f => f.required
      ).length;

      expect(screen.getAllByText(REQUIRED_ERROR)).toHaveLength(
        expectedErrorLength
      );

      // special case when user indicates the workshop has prerequisites
      await user.selectOptions(
        screen.getByRole('combobox', {
          name: `${config.fields.prereq.label} ${config.fields.prereq.helperMessage}`,
        }),
        'true'
      );

      await user.click(publishButton);

      expect(screen.getAllByText(REQUIRED_ERROR)).toHaveLength(
        // prereq isn't required in the config. it only becomes required if the user
        // indicates it has prerequisites
        expectedErrorLength + 1
      );

      await user.selectOptions(
        screen.getByRole('combobox', {
          name: `${config.fields.prereq.label} ${config.fields.prereq.helperMessage}`,
        }),
        'false'
      );

      await user.click(publishButton);

      expect(screen.getAllByText(REQUIRED_ERROR)).toHaveLength(
        expectedErrorLength
      );

      // special case when user clears session date input
      const dateInput = screen.getByLabelText('Date');
      await user.clear(dateInput);

      await user.click(publishButton);

      expect(screen.getAllByText(REQUIRED_ERROR)).toHaveLength(
        expectedErrorLength + 1
      );

      await user.type(dateInput, '2025-03-28');

      await user.click(publishButton);

      expect(screen.getAllByText(REQUIRED_ERROR)).toHaveLength(
        expectedErrorLength
      );
    }
  );
});
