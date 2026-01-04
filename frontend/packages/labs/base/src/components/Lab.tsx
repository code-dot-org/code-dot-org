import React, {Suspense, PropsWithChildren} from 'react';

import type {Level} from '@code-dot-org/api/models/levels';

import Loading from '@lab-base/components/loading';

export interface LabProps extends PropsWithChildren {
  labView?: React.ComponentType<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    levelData: Level<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }>,
  level?: Level,
}

/**
 * A simple container for a lazily loaded lab.
 *
 * The `labView` can be a `React.lazy` loaded lab or a Next.js `dynamic` import.
 * While the content loads, the `<Loading/>` component will be visible.
 */
const Lab: React.FunctionComponent<LabProps> = ({labView, level}) => {
  const LabView = labView;

  return (
    <Suspense fallback={<Loading isLoading={true} />}>
      {(LabView && level) && (
        <LabView levelData={level} />
      )}
    </Suspense>
  );
};

export default Lab;
