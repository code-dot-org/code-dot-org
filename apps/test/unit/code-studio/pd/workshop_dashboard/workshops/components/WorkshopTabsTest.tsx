import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {MemoryRouter, Route, Routes} from 'react-router-dom';

import {WorkshopTabs} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshops/components/WorkshopTabs';

const tabList = [
  {label: 'Overview', path: ''},
  {label: 'Enrollment', path: 'enrollments'},
  {label: 'Surveys', path: 'surveys'},
];

function renderWithRouter({initialPath = '/workshops/123'} = {}) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/workshops/:workshopId/*"
          element={<WorkshopTabs tabList={tabList} />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('WorkshopTabs', () => {
  it('renders all tabs', () => {
    renderWithRouter();
    tabList.forEach(tab => {
      expect(screen.getByRole('tab', {name: tab.label})).toBeInTheDocument();
    });
  });

  it('selects the correct tab based on the route', () => {
    renderWithRouter({initialPath: '/workshops/123/enrollments'});
    const enrollmentTab = screen.getByRole('tab', {name: 'Enrollment'});
    expect(enrollmentTab).toHaveAttribute('aria-selected', 'true');
  });

  it('navigates to the correct route when a tab is clicked', async () => {
    renderWithRouter();
    const user = userEvent.setup();
    const surveysTab = screen.getByRole('tab', {name: 'Surveys'});
    await user.click(surveysTab);
    expect(screen.getByRole('tab', {name: 'Surveys'})).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });
});
