import {Box, CircularProgress, Typography} from '@mui/material';
import {createFileRoute, redirect} from '@tanstack/react-router';

import {DashboardApiClient} from '@code-dot-org/core/api';

import {signInRedirectHref} from '@/modules/auth';

export const Route = createFileRoute('/projects/build-lab/new')({
  beforeLoad: ({context}) => {
    const returnTo = window.location.pathname + window.location.search;
    const href = signInRedirectHref(context.auth, returnTo);
    if (href) {
      // Use Rails sign-in directly; the SPA basepath would otherwise prefix the
      // URL when this route is served from the standalone Vite shell.
      throw redirect({href, reloadDocument: true});
    }
  },
  loader: async () => {
    const {channel} = await DashboardApiClient.projects.createBuildLabProject();

    throw redirect({
      to: '/projects/$labType/$channelId/edit',
      params: {labType: 'build-lab', channelId: channel},
    });
  },
  pendingComponent: () => (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        justifyContent: 'center',
        minHeight: 'calc(100vh - 160px)',
        p: 3,
        textAlign: 'center',
      }}
    >
      <CircularProgress aria-label="Creating Build Lab project" />
      <Typography component="p" variant="h5">
        Creating Build Lab project
      </Typography>
    </Box>
  ),
  component: () => null,
});
