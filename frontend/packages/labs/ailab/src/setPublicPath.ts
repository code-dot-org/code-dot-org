// Wire the runtime asset-path global into webpack's publicPath.
//
// Image imports (e.g. `import bot from './ai-bot-body.png'`) and any
// other webpack `asset` / `asset/resource` modules resolve their URLs
// against webpack's runtime `publicPath`. The default is `'auto'`,
// which infers the path from where the host page loaded the script —
// not what we want when the package is embedded into a consumer like
// apps's dashboard, which serves these images from a different base
// path (e.g. `/blockly/media/skins/ailab/`).
//
// Webpack exposes `__webpack_public_path__` as a magic variable: any
// assignment to it at runtime updates the publicPath used by
// subsequently-evaluated asset modules. We pull the desired base from
// the same global the dataset/manifest loader already uses
// (`__ml_playground_asset_public_path__`), so the consumer has one
// knob to turn.
//
// This module MUST be imported before any module that pulls in an
// image — i.e. it should be the first import in the entry file.
// ECMAScript guarantees depth-first evaluation order: when an entry
// does `import './setPublicPath'; import './index';`, this module's
// body runs to completion before `./index` starts evaluating, so all
// downstream asset modules see the updated `__webpack_public_path__`.
// `__webpack_public_path__` is a webpack magic variable: at build time
// webpack rewrites assignments to it as updates to its runtime
// `__webpack_require__.p`. ESLint doesn't understand this — it sees a
// `let` with a single assignment and no read, hence the disables.
/* eslint-disable prefer-const, @typescript-eslint/no-unused-vars */
declare let __webpack_public_path__: string;
__webpack_public_path__ =
  (global as unknown as Record<string, string>)
    .__ml_playground_asset_public_path__ || './';
/* eslint-enable prefer-const, @typescript-eslint/no-unused-vars */
