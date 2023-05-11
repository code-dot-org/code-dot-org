// This is a _very_ thin convenience wrapper around react-loading-skeleton
// to workaround an import issue and to also import the required css file.

// Writing this as `import ... from 'react-loading-skeleton'` will cause
// webpack to use index.mjs due to the way the package.json file for
// react-loading-skeleton is written. As a workaround, we import the .js
// file directly to bypass webpack module resolution. (See also
// https://github.com/webpack/webpack/issues/5756.)
import Skeleton from 'react-loading-skeleton/dist/index.js';

import 'react-loading-skeleton/dist/skeleton.css';

export default Skeleton;
