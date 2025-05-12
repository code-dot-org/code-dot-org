import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import {
  REQUIRED_ERROR,
  WorkshopFormTemplate,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/WorkshopFormTemplate';
import {workshopLabel} from '@cdo/apps/code-studio/pd/workshop_dashboard/WorkshopFormTemplate/utils';
import {WorkshopCourseConfigs} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import {useFetch} from '@cdo/apps/util/useFetch';

jest.mock('@cdo/apps/util/useFetch');

const mockedUseFetch = useFetch;

describe('WorkshopFormTemplate', () => {
  const testConfigs = WorkshopCourseConfigs.map(config => [
    config.label,
    config,
  ]);
  let user;

  const renderDefault = (props = {}) =>
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<WorkshopFormTemplate {...props} />} />
        </Routes>
      </MemoryRouter>
    );

  beforeEach(() => {
    user = userEvent.setup();
    mockedUseFetch.mockReturnValue({data: null, loading: false, error: null});
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
        expect(screen.getByText(field.label)).toBeInTheDocument();
        if (field.helperMessage) {
          expect(screen.getByText(field.helperMessage)).toBeInTheDocument();
        }
      });
    }
  );

  it.each(testConfigs)(
    'pre-fills regional partner if there is one option for %s',
    async (_, config) => {
      renderDefault({
        config,
        regionalPartnerData: [{id: 1, name: 'Regional Partner 1'}],
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
      renderDefault({
        config,
        regionalPartnerData: [
          {id: 1, name: 'Regional Partner 1'},
          {id: 2, name: 'Regional Partner 2'},
        ],
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
        expect(screen.getByText(field.label)).toBeInTheDocument();
        if (field.required) {
          if (field.helperMessage) {
            expect(
              screen.queryByText(field.helperMessage)
            ).not.toBeInTheDocument();
          }
        }
      });
      expect(screen.getAllByText(REQUIRED_ERROR)).toHaveLength(
        Object.values(config.fields).filter(f => f.required).length
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
        Object.values(config.fields).filter(f => f.required).length + 1
      );

      await user.selectOptions(
        screen.getByRole('combobox', {
          name: `${config.fields.prereq.label} ${config.fields.prereq.helperMessage}`,
        }),
        'false'
      );

      await user.click(publishButton);

      expect(screen.getAllByText(REQUIRED_ERROR)).toHaveLength(
        Object.values(config.fields).filter(f => f.required).length
      );

      // special case when user clears session date input
      const dateInput = screen.getByLabelText('Date');
      await user.clear(dateInput);

      await user.click(publishButton);

      expect(screen.getAllByText(REQUIRED_ERROR)).toHaveLength(
        Object.values(config.fields).filter(f => f.required).length + 1
      );

      await user.type(dateInput, '2025-03-28');

      await user.click(publishButton);

      expect(screen.getAllByText(REQUIRED_ERROR)).toHaveLength(
        Object.values(config.fields).filter(f => f.required).length
      );
    }
  );
});
