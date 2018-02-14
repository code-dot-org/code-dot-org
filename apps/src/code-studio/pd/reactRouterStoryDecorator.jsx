/**
 * @file Wrapper to provide a fake empty router context
 * Attach to storybook via
 *    import reactRouterStoryDecorator from 'reactRouterStoryDecorator';
 *    storybook.addDecorator(reactRouterStoryDecorator)
 */
import React from 'react';
import WithContext from "react-with-context";

const context = {
  router: {
    createHref() {},
    push() {},
    replace() {}
  }
};

export default (story) => (
  <WithContext context={context}>
    {story()}
  </WithContext>
);
