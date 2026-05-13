// Placeholder share view. The full share experience (read-only console,
// preview, "Make my own"/"View code"/"Report abuse" sidebar) lands with
// the rest of the secondary-feature work; until then, the regular
// horizontal layout renders in share contexts so the page is not blank.
import React from 'react';

import HorizontalLayout from './HorizontalLayout';

const ShareView: React.FunctionComponent = () => <HorizontalLayout />;

export default ShareView;
