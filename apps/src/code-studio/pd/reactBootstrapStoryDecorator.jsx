/**
 * @file Currently the Bootstrap 3 styles required by React-Bootstrap are only
 * applied inside div#application-container. This is to prevent conflicts with
 * other parts of Code Studio using Bootstrap 2. See pd.scss. Without this
 * container div it won't render properly.
 * Attach to storybook via
 *    import reactBootstrapStoryDecorator from 'reactBootstrapStoryDecorator';
 *    storybook.addDecorator(reactBootstrapStoryDecorator)
 */
import React from 'react';

export default (story) => (
  <div id="application-container">
    {story()}
  </div>
);
