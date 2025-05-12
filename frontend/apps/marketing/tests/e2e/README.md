# End-to-End Tests for Marketing

This directory contains end-to-end (E2E) tests for the Code.org marketing application.

## Overview

The E2E tests are designed to ensure that the marketing application behaves as expected in a real-world environment. These tests simulate user interactions with the application and verify its functionality. This test suite is intended to be used very sparingly and only tests that cannot be accomplished in unit tests or integration tests should be added to this test suite.

## Prerequisites

To run the full set of tests locally, an [Applitools Eyes API Key](https://applitools.com/tutorials/getting-started/retrieve-api-key) is needed. Define `APPLITOOLS_API_KEY` in `marketing/.env` to use.

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
yarn test:ui:fork
```

### Updating the source control snapshot

To download a copy of the "All The Things" page to source control:

```bash
yarn test:ui:update-snapshot --environment <development|test|production>
```

If working on a fork and you want to update the version control version, specify the source entry id:

```bash
yarn test:ui:update-snapshot --enviornment development --source-entry-id <fork experience entry id>
```

### Updating "All The Things" on Contentful from source control

To upload the source control version of "All the Things" to Contentful:

```bash
yarn test:ui:publish-snapshot --environment <development|test|production>
```

This will save "All The Things", open up the experience in the associated environment and publish the page if it looks correct.

**Note**: Normally for a merge to `test` or `production`, you will want to do this after merging your PR.

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
