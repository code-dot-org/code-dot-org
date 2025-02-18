# Code.org Marketing Application

## Getting Started

### Secrets

Contentful API Keys and other secrets will need to be populated for this application to run correctly.

1. Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```
2. For each entry in `.env`, see the instructions for how to obtain an API Key.

**Note**: `.env` must not be committed to source. It is git ignored by default.

### Developing

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Creating New Components

When creating a new component for the design system, setup the following structure. For this example, the `ExampleButton` component is to be created. Substitute this name for the component to be created.

1. Create skeleton directories:
   ```bash
   yarn workspace @code-dot-org/dsco exec mkdir -p src/ExampleButton src/ExampleButton/__tests__ src/ExampleButton/stories
   ```
2. Create the `ExampleButton.tsx` file which will be your react component. See other components in `src` for examples.
3. Create the `index.ts` file which will re-export `ExampleButton` and optionally define a [Contentful Component Defintiion](https://www.contentful.com/developers/docs/experiences/register-custom-components/). A definition is not needed if the component will not be used in Contentful Studio.
4. Add `ExampleButton` exports in `package.json` under the `exports` field.
5. Create `ExampleButton.test.tsx` in the `__tests__` directory and implement jest unit tests.
6. Create `ExampleButton.story.tsx` using [Storybook Component Story Format](https://storybook.js.org/docs/api/csf) in the `stories` directory.

## Docker

This package uses [Turborepo pruning](https://turbo.build/repo/docs/guides/tools/docker) to produce a minimial docker image that uses standalone nextjs.

To build a docker image, run this command in the `frontend` directory:

```bash
docker build -f apps/marketing/Dockerfile .
```
