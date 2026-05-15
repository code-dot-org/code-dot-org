import {Box} from '@mui/material';

import type {Connectivity} from '@/modules/catalog/hooks/useCatalog';

interface Props {
  state: Connectivity;
}

/**
 * Small, non-blocking header chip. The UX brief forbids full-screen offline
 * errors; this is the only place we communicate connectivity.
 */
export default function ConnectivityChip({state}: Props) {
  const isOnline = state === 'online';
  const dot = isOnline ? '#2e7d32' : '#9e9e9e';
  const text = isOnline ? 'Online' : 'Offline';
  return (
    <Box
      role="status"
      aria-live="polite"
      aria-label={`Connectivity: ${text}`}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '999px',
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
        fontSize: '12px',
        fontWeight: 600,
        color: '#333',
        minHeight: '24px',
      }}
    >
      <Box
        component="span"
        aria-hidden
        sx={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: dot,
        }}
      />
      {text}
    </Box>
  );
}
