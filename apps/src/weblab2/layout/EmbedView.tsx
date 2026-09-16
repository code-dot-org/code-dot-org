import React from 'react';

import {HTMLPreview} from '@cdo/apps/weblab2/htmlPreview/HTMLPreview';

import moduleStyles from './embed-view.module.scss';

// The widget alone. VerticalLayout still renders the instructions panel and the
// workspace header under widgetView, which is more chrome than a widget sitting
// inside a page of markdown can carry.
const EmbedView: React.FunctionComponent = () => (
  <div className={moduleStyles.embedContainer}>
    <HTMLPreview />
  </div>
);

export default EmbedView;
