import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {TimeZoneEditor} from '@cdo/apps/code-studio/pd/workshop_dashboard/WorkshopFormTemplate/components/TimeZoneEditor';
import {WorkshopCourseConfigs} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

const config = WorkshopCourseConfigs.find(
  ({slug}) => slug === 'build_your_own_workshop'
);

describe('TimeZoneEditor', () => {
  const mockHandleChange = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    mockHandleChange.mockClear();
  });

  it('renders the initial timezone and text', () => {
    render(
      <TimeZoneEditor
        timeZone="America/Denver"
        handleChange={mockHandleChange}
        config={config}
      />
    );

    expect(screen.getByText(config.fields.time_zone.label)).toBeInTheDocument();
    expect(screen.getByText('America/Denver')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('shows the dropdown when edit is clicked', async () => {
    render(
      <TimeZoneEditor
        timeZone="America/Denver"
        handleChange={mockHandleChange}
        config={config}
      />
    );

    const editButton = screen.getByText('Edit');
    await user.click(editButton);

    expect(
      screen.getByRole('combobox', {name: config.fields.time_zone.label})
    ).toBeInTheDocument();
  });

  it('calls handleChange when a new timezone is selected', async () => {
    render(
      <TimeZoneEditor
        timeZone="America/Denver"
        handleChange={mockHandleChange}
        config={config}
      />
    );

    const editButton = screen.getByText('Edit');
    await user.click(editButton);

    const timezoneDropdown = screen.getByRole('combobox', {
      name: config.fields.time_zone.label,
    });
    await user.selectOptions(timezoneDropdown, 'America/Chicago');

    await waitFor(() => {
      expect(mockHandleChange).toHaveBeenCalledTimes(1);
      expect(mockHandleChange).toHaveBeenCalledWith('America/Chicago');
    });
  });

  it('shows the check icon when a new timezone is selected', async () => {
    render(
      <TimeZoneEditor
        timeZone="America/Denver"
        handleChange={mockHandleChange}
        config={config}
      />
    );

    const editButton = screen.getByText('Edit');
    await user.click(editButton);

    const timezoneDropdown = screen.getByRole('combobox', {
      name: config.fields.time_zone.label,
    });
    await user.selectOptions(timezoneDropdown, 'America/Chicago');

    const confirmationIcon = screen.getByLabelText('timezone changed');

    await waitFor(() => {
      expect(confirmationIcon).toBeInTheDocument();
    });
  });
});
