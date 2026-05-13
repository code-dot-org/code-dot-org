// TODO(javalab-lab2): delete after migration completes.
// Java Lab is now served through the lab2 stack
// (apps/src/javalab/lab2/entrypoint.ts); this entry point is no longer
// reached once uses_lab2? returns true on the Javalab Rails level.
import loadAppOptions from '@cdo/apps/code-studio/initApp/loadApp';

import loadJavalab from './init/loadJavalab';

loadAppOptions().then(loadJavalab);
