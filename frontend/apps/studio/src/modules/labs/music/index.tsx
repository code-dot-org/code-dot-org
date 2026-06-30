import MusicLab from '@code-dot-org/music-lab';

import LabProviders from '@/modules/labs/LabProviders';

interface MusicContainerProps {
  /**
   * Standalone project channel from the route. The music `App` otherwise reads
   * the channel from a legacy `/app/projects/music/:channel/edit` URL regex
   * that does not match studio's `/frontend-studio/...` path, so the host must
   * supply it from the route param.
   */
  channelId?: string;
}

/**
 * Studio entry point for the Music lab. The music `App` reads the host's API
 * client via `useApiClient` (to build its music API client) and relies on the
 * shared store and react-query client that `@code-dot-org/lab`'s `BlocklyLab`
 * needs. Supply that provider stack at the lab boundary, then render the lab.
 * Mirrors the oceans host.
 */
export default function MusicContainer({channelId}: MusicContainerProps) {
  return (
    <LabProviders>
      <MusicLab isLoading={false} channelId={channelId} />
    </LabProviders>
  );
}
