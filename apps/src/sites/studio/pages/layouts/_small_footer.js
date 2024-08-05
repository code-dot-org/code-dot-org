import React from 'react';
import {createRoot} from 'react-dom/client';

import SmallFooter from '@cdo/apps/code-studio/components/SmallFooter';
import getScriptData from '@cdo/apps/util/getScriptData';

const root = createRoot(document.getElementById('page-small-footer'));
root.render(<SmallFooter {...getScriptData('smallfooter')} />);
