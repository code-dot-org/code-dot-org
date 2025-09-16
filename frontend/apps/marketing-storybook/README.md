# Marketing Storybook

This directory contains Storybook stories and tests for the marketing site components used in Contentful.

## Add components to Storybook

1. Load the Contentful Experience with the component you want to add in the development server.
2. Open the page preview and open dev tools.
3. Go to React dev tools Components panel.
4. Find your Contentful component and select it.
5. Click on the little bug icon, "Log this component data to the console".
6. Open the Console panel.
7. Expand the object.
8. Right click on the object next to Props.
9. Copy the object.
10. Add the copied object content to `frontend/apps/marketing-storybook/stories/__mocks__`.
11. Consume mock(s) in stories.

You may need to do the above steps for additional linked entries like images or buttons on the component, see this PR [#67839](https://github.com/code-dot-org/code-dot-org/pull/67839) for an example.

See [this Slack message](https://codedotorg.slack.com/archives/C07UW4ED66Q/p1755787328463799?thread_ts=1755726382.487159&cid=C07UW4ED66Q) for a video example of how to get the object data.
