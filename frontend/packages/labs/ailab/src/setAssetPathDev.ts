// Dev-only: seed the asset-path global for the standalone dev host page.
//
// Production consumers (e.g. dashboard) call setAssetPath(...) themselves
// before loading the bundle, pointing it at wherever they serve the
// datasets. In dev the standalone index.html IS the consumer, so we inline
// the assignment here.
//
// Import this FIRST in main.tsx so the global is set before the direct
// readers in `index.tsx` / `SelectDataset.tsx` build dataset URLs from it.
// ESM guarantees depth-first evaluation in import order, so this module's
// body runs before any later import is evaluated.
//
// Value: './' — the five UI images are inlined into the bundle (no runtime
// path), and the Vite dev server's `dev-datasets` middleware serves
// `public/datasets/*` at `/datasets/*`. So a root-relative single prefix
// resolves the datasets.
import {setAssetPath} from './assetPath';

setAssetPath('./');
