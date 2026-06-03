// Dev-only: seed the asset-path global for the standalone dev host page.
//
// Production consumers (e.g. dashboard) call setAssetPath(...) themselves
// before loading the bundle, pointing it at wherever they serve the
// images + datasets. In dev the standalone index.html IS the consumer,
// so we inline the assignment here.
//
// Import this FIRST in indexDev.tsx so the global is set before either
// `setPublicPath` reads it for webpack's `__webpack_public_path__` OR
// the direct readers in `index.tsx` / `SelectDataset.tsx` build URLs
// from it. ESM guarantees depth-first evaluation in import order, so
// this module's body runs before any later import is evaluated.
//
// Value: './' — webpack emits images to `images/` (in-memory, served by
// webpack-dev-middleware) and `webpack-dev-server --static public`
// serves `public/datasets/*` at `/datasets/*` on disk. Both sit at the
// root, so the single-prefix model works.
import {setAssetPath} from './assetPath';

setAssetPath('./');
