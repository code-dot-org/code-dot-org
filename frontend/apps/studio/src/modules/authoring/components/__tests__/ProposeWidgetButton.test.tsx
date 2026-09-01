import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {PropsWithChildren} from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import type {ProposeConfig, ProposeWidgetResult} from '../../api';
import {authoringApi} from '../../api';
import {ProposeWidgetButton} from '../ProposeWidgetButton';

vi.mock('../../api', () => ({
  authoringApi: {
    fetchProposeConfig: vi.fn(),
    proposeWidget: vi.fn(),
  },
}));

const fetchProposeConfig = vi.mocked(authoringApi.fetchProposeConfig);
const proposeWidget = vi.mocked(authoringApi.proposeWidget);

function wrapper() {
  const queryClient = new QueryClient();
  return function Wrapper({children}: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

const NO_REMOTES: ProposeConfig = {};
const WITH_CATALOG_REMOTE: ProposeConfig = {remote: 'stephen'};
const WITH_BOTH_REMOTES: ProposeConfig = {
  remote: 'stephen',
  staffAppsRemote: 'git@github.com:codeai-staff-apps/widgets.git',
};

const OK_CATALOG_DRY_RUN: ProposeWidgetResult = {
  ok: true,
  target: 'catalog',
  mode: 'dry-run',
  slug: 'pick-your-blocks',
  version: '1.0.0',
  branch: 'widget-catalog/pick-your-blocks-v1.0.0',
  baseCommit: 'abc123',
  commit: 'def456',
  files: [
    {
      path: 'frontend/packages/widgets-catalog/widgets/pick-your-blocks/src/index.tsx',
      content: '// widget source',
    },
    {
      path: 'frontend/packages/widgets-catalog/widgets/pick-your-blocks/PROVENANCE.md',
      content: '# Provenance\n\nSome provenance text.',
    },
  ],
  diffstat: '2 files changed',
};

describe('ProposeWidgetButton', () => {
  beforeEach(() => {
    fetchProposeConfig.mockReset();
    proposeWidget.mockReset();
  });

  it('runs a catalog dry-run on open and disables Push when no remote is configured', async () => {
    fetchProposeConfig.mockResolvedValue(NO_REMOTES);
    proposeWidget.mockResolvedValue(OK_CATALOG_DRY_RUN);

    render(<ProposeWidgetButton widgetId="draft-widget-abc" />, {
      wrapper: wrapper(),
    });
    await userEvent.click(screen.getByRole('button', {name: /propose widget/i}));

    expect(proposeWidget).toHaveBeenCalledWith('draft-widget-abc', {
      target: 'catalog',
      mode: 'dry-run',
      remote: undefined,
    });
    expect(
      await screen.findByText(/propose pick-your-blocks v1\.0\.0 to the catalog\?/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /widgets-catalog\/widgets\/pick-your-blocks\/src\/index\.tsx/,
      ),
    ).toBeInTheDocument();

    const pushButton = screen.getByRole('button', {
      name: /push to \(no remote configured\)/i,
    });
    await waitFor(() => expect(pushButton).toBeDisabled());
    expect(
      screen.getByText(/AUTHORING_PROPOSE_REMOTE set on the authoring service/i),
    ).toBeInTheDocument();
  });

  it('disables the Staff Apps toggle when no staff-apps remote is configured', async () => {
    fetchProposeConfig.mockResolvedValue(WITH_CATALOG_REMOTE);
    proposeWidget.mockResolvedValue(OK_CATALOG_DRY_RUN);

    render(<ProposeWidgetButton widgetId="draft-widget-abc" />, {
      wrapper: wrapper(),
    });
    await userEvent.click(screen.getByRole('button', {name: /propose widget/i}));
    await screen.findByText(/propose pick-your-blocks/i);

    expect(
      screen.getByRole('button', {name: 'Staff Apps'}),
    ).toBeDisabled();
  });

  it('switches to staff-apps and re-runs the dry-run against that target', async () => {
    fetchProposeConfig.mockResolvedValue(WITH_BOTH_REMOTES);
    proposeWidget
      .mockResolvedValueOnce(OK_CATALOG_DRY_RUN)
      .mockResolvedValueOnce({
        ...OK_CATALOG_DRY_RUN,
        target: 'staff-apps',
        branch: 'widget/pick-your-blocks-v1.0.0',
        files: [
          {path: 'widgets/pick-your-blocks/widget.html', content: '<html></html>'},
          {path: 'widgets/pick-your-blocks/widget.json', content: '{}'},
        ],
      });

    render(<ProposeWidgetButton widgetId="draft-widget-abc" />, {
      wrapper: wrapper(),
    });
    await userEvent.click(screen.getByRole('button', {name: /propose widget/i}));
    await screen.findByText(/propose pick-your-blocks v1\.0\.0 to the catalog\?/i);

    await userEvent.click(screen.getByRole('button', {name: 'Staff Apps'}));

    expect(proposeWidget).toHaveBeenLastCalledWith('draft-widget-abc', {
      target: 'staff-apps',
      mode: 'dry-run',
      remote: 'git@github.com:codeai-staff-apps/widgets.git',
    });
    expect(
      await screen.findByText(/propose pick-your-blocks v1\.0\.0 to Staff Apps\?/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/widgets\/pick-your-blocks\/widget\.html/)).toBeInTheDocument();
  });

  it('shows the refusal reason and violations when the dry-run refuses', async () => {
    fetchProposeConfig.mockResolvedValue(WITH_CATALOG_REMOTE);
    proposeWidget.mockResolvedValue({
      ok: false,
      reason: 'widget document fails one or more contract gates',
      violations: ['network reference: fetch('],
    });

    render(<ProposeWidgetButton widgetId="draft-widget-bad" />, {
      wrapper: wrapper(),
    });
    await userEvent.click(screen.getByRole('button', {name: /propose widget/i}));

    expect(
      await screen.findByText(/can't propose this widget yet/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/fails one or more contract gates/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/network reference: fetch\(/)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: /^push to/i}),
    ).not.toBeInTheDocument();
  });

  it('a slug collision refusal shows the suggestion — the session\'s own seeded pick-your-blocks source widget', async () => {
    fetchProposeConfig.mockResolvedValue(WITH_CATALOG_REMOTE);
    proposeWidget.mockResolvedValue({
      ok: false,
      reason: 'slug "pick-your-blocks" already exists in the catalog',
      suggestion: 'pick-your-blocks-2',
    });

    render(<ProposeWidgetButton widgetId="draft-widget-c7917dd5" />, {
      wrapper: wrapper(),
    });
    await userEvent.click(screen.getByRole('button', {name: /propose widget/i}));

    expect(
      await screen.findByText(/already exists in the catalog/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/pick-your-blocks-2/)).toBeInTheDocument();
  });

  it('pushes the catalog target and renders the compare URL (no PR opened)', async () => {
    fetchProposeConfig.mockResolvedValue(WITH_CATALOG_REMOTE);
    proposeWidget.mockResolvedValueOnce(OK_CATALOG_DRY_RUN).mockResolvedValueOnce({
      ...OK_CATALOG_DRY_RUN,
      mode: 'push',
      compareUrl:
        'https://github.com/code-dot-org/code-dot-org/compare/staging...stephenliang:widget-catalog/pick-your-blocks-v1.0.0?expand=1',
    });

    render(<ProposeWidgetButton widgetId="draft-widget-abc" />, {
      wrapper: wrapper(),
    });
    await userEvent.click(screen.getByRole('button', {name: /propose widget/i}));
    const pushButton = await screen.findByRole('button', {
      name: /push to stephen/i,
    });
    await waitFor(() => expect(pushButton).toBeEnabled());
    await userEvent.click(pushButton);

    expect(proposeWidget).toHaveBeenLastCalledWith('draft-widget-abc', {
      target: 'catalog',
      mode: 'push',
      remote: 'stephen',
    });
    expect(await screen.findByText(/no pull request was opened/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /compare\/staging\.\.\.stephenliang:widget-catalog/i,
      }),
    ).toBeInTheDocument();
  });

  it('pushes the staff-apps target and renders the opened pull request URL', async () => {
    fetchProposeConfig.mockResolvedValue(WITH_BOTH_REMOTES);
    const staffAppsDryRun: ProposeWidgetResult = {
      ...OK_CATALOG_DRY_RUN,
      target: 'staff-apps',
      branch: 'widget/pick-your-blocks-v1.0.0',
    };
    proposeWidget
      .mockResolvedValueOnce(OK_CATALOG_DRY_RUN)
      .mockResolvedValueOnce(staffAppsDryRun)
      .mockResolvedValueOnce({
        ...staffAppsDryRun,
        mode: 'push',
        compareUrl:
          'https://github.com/codeai-staff-apps/widgets/compare/main...widget/pick-your-blocks-v1.0.0?expand=1',
        prUrl: 'https://github.com/codeai-staff-apps/widgets/pull/42',
      });

    render(<ProposeWidgetButton widgetId="draft-widget-abc" />, {
      wrapper: wrapper(),
    });
    await userEvent.click(screen.getByRole('button', {name: /propose widget/i}));
    await screen.findByText(/propose pick-your-blocks/i);
    await userEvent.click(screen.getByRole('button', {name: 'Staff Apps'}));
    const pushButton = await screen.findByRole('button', {
      name: /push to git@github\.com/i,
    });
    await waitFor(() => expect(pushButton).toBeEnabled());
    await userEvent.click(pushButton);

    expect(proposeWidget).toHaveBeenLastCalledWith('draft-widget-abc', {
      target: 'staff-apps',
      mode: 'push',
      remote: 'git@github.com:codeai-staff-apps/widgets.git',
    });
    expect(await screen.findByText(/pull request opened/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', {name: /codeai-staff-apps\/widgets\/pull\/42/i}),
    ).toBeInTheDocument();
  });
});
