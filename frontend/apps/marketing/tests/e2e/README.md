# End-to-End Tests for Marketing

This directory contains end-to-end (E2E) tests for the Code.org marketing application.

## Overview

The E2E tests are designed to ensure that the marketing application behaves as expected in a real-world environment. These tests simulate user interactions with the application and verify its functionality. This test suite is intended to be used very sparingly and only tests that cannot be accomplished in unit tests or integration tests should be added to this test suite.

## Prerequisites

To run the full set of tests locally, an [Applitools Eyes API Key](https://applitools.com/tutorials/getting-started/retrieve-api-key) is needed. Define `APPLITOOLS_API_KEY` in `marketing/.env` to use.

You will also want a copy of `marketing/.env` for each site to copy the UI test experience to:

1. `marketing/.env.corporate`: The Corporate website environment variables
2. `marketing/.env.csforall`: The CSForAll environment variables

## Running Tests

### Against a local server

To execute the E2E tests against a local server running on `localhost:3001`, run the following command:

**In Playwright UI Mode (recommended):**

```bash
yarn test:ui:local --ui
```

**In CLI mode:**

```bash
yarn test:ui:local
```

### Against a target stage

To execute the E2E tests against a specific stage, such as the test or production stages, add the `STAGE` environment variable:

```bash
STAGE=<pr|test|production> yarn test:ui:local --ui
```

**In CLI mode:**

```bash
STAGE=<pr|test|production> yarn test:ui:local
```

## All The Things

"All The Things" is a special page for the purpose of testing all UI components on a single page complete with an integration with Contentful. A special tool has been created to manage creating and updating "All The Things" tests. This page is normally updated using the source control version of the page via the Contentful management API.

All The Things can be found on all environments with the sub-path `/all-the-things`.

### Forking

To update the "All The Things" page, execute the fork command which will take the `production` version of the page and create a copy on the `development` environment. Use this forked copy to manually make changes to the page on the Contentful experience builder.

### Creating a fork

To create a fork:

```bash
yarn test:ui:fork --env .env.corporate
```

### Updating the source control snapshot

To download a copy of the "All The Things" page to source control:

```bash
yarn test:ui:update-snapshot --env .env.corporate --environment <development|test|production>
```

If working on a fork and you want to update the version control version, specify the source entry id:

```bash
yarn test:ui:update-snapshot --env .env.corporate --environment development --source-entry-id <fork experience entry id>
```

### Updating "All The Things" on Contentful from source control

To upload the source control version of "All the Things" to Contentful. **Be sure to repeat for other site types.**

```bash
yarn test:ui:publish-snapshot --env .env.corporate --environment <development|test|production>
```

This will save "All The Things", open up the experience in the associated environment and publish the page if it looks correct.

**Note**: Normally for a merge to `test` or `production`, you will want to do this after merging your PR.

### ✅ How to add or update a component step-by-step

1. Create a new fork (see [Forking](#forking) section above):

```bash
yarn test:ui:fork --env .env.corporate
```

2. Make updates on the forked page in Contentful.

- Any new content entries used in your component(s) should be prepended with "❌ [ENG]" to indicate they are for engineering/testing purposes only. These entries will be copied to Production in Step 9.
- Make sure top level sections have a Fixed height in the Design sidebar in the Experiences editor, this can prevent page shifting in preparation to add Eyes tests in Step 11.

3. Create a PR with the updates from steps 1-3. Label this PR with `All The Things` which will trigger the UI tests to test against the forked page.

4. Once the PR is merged, update your workspace with `staging`.

5. Publish the updated snapshot in the `development` environment to the corporate site (repeat for other site types):

```bash
yarn test:ui:publish-snapshot --env .env.corporate --environment development
```

6. Open the development output link in the terminal in Contentful, and Publish the experience.

7. Publish the updated snapshot in the `test` environment (repeat for other site types):

```bash
yarn test:ui:publish-snapshot --env .env.corporate --environment test
```

8. Publish the updated snapshot in the `production` environment (repeat for other site types):

```bash
yarn test:ui:publish-snapshot --env .env.corporate --environment production
```

9. Publish updated `production` version of the All The Things page in Contentful. Repeat for other site types.

10. **If you're adding a new component:** add the component to the Section Types on `/apps/marketing/tests/e2e/pom/all-the-things.ts` and add unit and Eyes tests to `/apps/marketing/tests/e2e/all-the-things.spec.ts`. Create/merge a PR with these tests.

11. Eyes diffs may show up in a Marketing-App-Deploy message in the _#infra-marketing-app-staging_ Slack channel.

12. Approve Eyes diffs and rerun failed tests if needed.

#### ⛔️ Troubleshooting

If tests or builds continue to fail and you need to make updates to the All The Things page to fix something, you will need to follow these steps each time.

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
