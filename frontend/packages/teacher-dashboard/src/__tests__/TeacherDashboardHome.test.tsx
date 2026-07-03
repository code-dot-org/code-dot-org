import {render, screen, within} from '@testing-library/react';
import {http, HttpResponse} from 'msw';
import {describe, expect, it} from 'vitest';

import {mockServer} from '@code-dot-org/core/api/mocks/server';

import {emptySections} from '../fixtures/empty';
import {listSections} from '../fixtures/list';
import {TeacherDashboardHome} from '../index';

function mockSectionsResponse(sections: unknown[]) {
  mockServer.use(
    http.get('*/api/v1/sections', () => HttpResponse.json(sections)),
  );
}

describe('TeacherDashboardHome', () => {
  describe('TD-HOME-EMPTY', () => {
    it('renders the empty state for a teacher with zero sections', async () => {
      mockSectionsResponse(emptySections);
      const {container} = render(<TeacherDashboardHome />);

      expect(await screen.findByText(/empty here/i)).toBeInTheDocument();
      expect(
        screen.getByText(/haven.t created any class sections/i),
      ).toBeInTheDocument();
      // The illustration is decorative (alt=""), so it's intentionally
      // absent from the accessibility tree — query the DOM directly.
      expect(container.querySelector('img')).toBeInTheDocument();
    });

    it('renders no section card or list for a teacher with zero sections', async () => {
      mockSectionsResponse(emptySections);
      render(<TeacherDashboardHome />);

      await screen.findByText(/empty here/i);
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('exposes a single logical heading for the empty region', async () => {
      mockSectionsResponse(emptySections);
      render(<TeacherDashboardHome />);

      await screen.findByText(/empty here/i);
      expect(screen.getAllByRole('heading')).toHaveLength(1);
    });
  });

  describe('TD-HOME-SECTION-LIST', () => {
    it('renders exactly two read-only section cards', async () => {
      mockSectionsResponse(listSections);
      render(<TeacherDashboardHome />);

      const list = await screen.findByRole('list');
      expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    });

    it('shows the assigned course display name and student count for the assigned section', async () => {
      mockSectionsResponse(listSections);
      render(<TeacherDashboardHome />);

      const list = await screen.findByRole('list');
      expect(
        within(list).getByText(/Single-Unit Course 2026/),
      ).toBeInTheDocument();
      expect(within(list).getByText(/1 student\b/)).toBeInTheDocument();
    });

    it('shows the unassigned affordance and zero student count for the unassigned section', async () => {
      mockSectionsResponse(listSections);
      render(<TeacherDashboardHome />);

      const list = await screen.findByRole('list');
      expect(within(list).getByText(/no course assigned/i)).toBeInTheDocument();
      expect(within(list).getByText(/0 students/)).toBeInTheDocument();
    });

    it('renders no mutating control', async () => {
      mockSectionsResponse(listSections);
      render(<TeacherDashboardHome />);

      await screen.findByRole('list');
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('shows the section code with legacy label terminology', async () => {
      mockSectionsResponse(listSections);
      render(<TeacherDashboardHome />);

      const list = await screen.findByRole('list');
      expect(
        within(list).getByText(/Section code: ABCDEF/),
      ).toBeInTheDocument();
      expect(within(list).queryByText(/join code/i)).not.toBeInTheDocument();
    });

    it('shows a read-only avatar label from avatar_color/avatar_emoji', async () => {
      mockSectionsResponse(listSections);
      render(<TeacherDashboardHome />);

      const list = await screen.findByRole('list');
      // Fixtures: Period 1 = color 0/emoji 0, Period 2 = color 1/emoji 1,
      // named "{Color}, {Emoji}" per the legacy SectionAvatar mapping.
      expect(
        within(list).getByRole('img', {name: 'Magenta, Fire'}),
      ).toBeInTheDocument();
      expect(
        within(list).getByRole('img', {name: 'Pink, Penguin'}),
      ).toBeInTheDocument();
    });

    it('nests card headings under a region-level heading', async () => {
      mockSectionsResponse(listSections);
      render(<TeacherDashboardHome />);

      await screen.findByRole('list');
      expect(
        screen.getByRole('heading', {level: 2, name: /class sections/i}),
      ).toBeInTheDocument();
      expect(screen.getAllByRole('heading', {level: 3})).toHaveLength(2);
    });
  });

  describe('error state', () => {
    it('announces an error instead of an indefinite silent loading state', async () => {
      mockServer.use(
        http.get('*/api/v1/sections', () =>
          HttpResponse.json({error: 'boom'}, {status: 500}),
        ),
      );
      render(<TeacherDashboardHome />);

      expect(
        await screen.findByRole(
          'alert',
          {},
          // The shared query client retries twice before settling into error.
          {timeout: 15_000},
        ),
      ).toHaveTextContent(/went wrong loading your class sections/i);
    });
  });
});
