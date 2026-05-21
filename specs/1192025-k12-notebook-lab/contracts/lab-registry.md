# Contract: Studio Lab Registry Integration

The notebook-lab plugs into studio via the same two-file convention that `music-lab` and `oceans-lab` already use. This contract pins what those two files look like after the integration, plus the single route file.

## File 1 — `frontend/apps/studio/src/config/labs.ts`

Add `'notebook'` to the `AVAILABLE_LABS` literal. Other entries left untouched.

```ts
export const AVAILABLE_LABS = ['music', 'oceans', 'notebook'] as const;
export type LabType = typeof AVAILABLE_LABS[number];
```

No other change to this file.

## File 2 — `frontend/apps/studio/src/router/getLabEntrypoint.ts`

Add a `case 'notebook'` branch mirroring the existing labs. Use a dynamic import so the lab chunk is lazy.

```ts
import { lazy } from 'react';
import type { LabType } from '@/config/labs';

export function getLabEntrypoint(labType: LabType) {
  switch (labType) {
    case 'music':
      return lazy(() => import('@code-dot-org/music-lab'));
    case 'oceans':
      return lazy(() => import('@code-dot-org/oceans-lab'));
    case 'notebook':
      return lazy(() => import('@code-dot-org/notebook-lab'));
    default: {
      const _exhaustive: never = labType;
      throw new Error(`Unknown lab type: ${_exhaustive as string}`);
    }
  }
}
```

The `@code-dot-org/notebook-lab` workspace name MUST match the new package's `package.json`.

## File 3 — `frontend/apps/studio/src/routes/projects/notebook/$channelId/edit.tsx`

One new route file. The router plugin (TanStack) regenerates `routeTree.gen.ts` automatically; do not hand-edit the generated file.

```tsx
import { createFileRoute, useParams } from '@tanstack/react-router';
import { Suspense } from 'react';
import { getLabEntrypoint } from '@/router/getLabEntrypoint';

export const Route = createFileRoute('/projects/notebook/$channelId/edit')({
  component: NotebookLabRoute,
});

const NotebookLab = getLabEntrypoint('notebook');

function NotebookLabRoute() {
  const { channelId } = useParams({ from: '/projects/notebook/$channelId/edit' });
  return (
    <Suspense fallback={null}>
      <NotebookLab channelId={channelId} />
    </Suspense>
  );
}
```

The lab's default export is a React component accepting `{ channelId: string }`; resolution semantics for `channelId` are defined in `contracts/url-contracts.md`.

## Lab package contract (`@code-dot-org/notebook-lab`)

```ts
// frontend/packages/labs/notebook-lab/src/index.tsx
import { type FC } from 'react';

export interface NotebookLabProps {
  /** "default" | "new" | "artifact" | <UUIDv4> */
  channelId: string;
}

declare const NotebookLab: FC<NotebookLabProps>;
export default NotebookLab;
```

The component MUST be safe to render multiple times (it is, by virtue of the underlying React tree), MUST honor reduced-motion, MUST defer all heavy imports (CodeMirror, Pyodide bootstrap, video.js, qrcode) until first needed, and MUST mount its own internal navigator for index/settings (no additional studio routes).

## Mobile shell change

`frontend/apps/mobile/capacitor.config.ts` adds `@capacitor/browser` to `includePlugins` (used for the FR-011 video fallback to open externally). Add the workspace dep with `yarn workspace @code-dot-org/mobile add @capacitor/browser`, then `cap sync`.

## Versioning

Lab-registry contract is v1.0. Adding a new lab type is a MINOR bump; renaming or removing a lab type is a MAJOR bump and requires studio + curriculum coordination.
