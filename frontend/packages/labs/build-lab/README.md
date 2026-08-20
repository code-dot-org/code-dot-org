# @code-dot-org/build-lab

Build Lab is an interactive prototype for a unified block-based app and game
authoring experience. It is a standalone Vite lab and can also be lazy-loaded
by the frontend Studio shell.

## Development

From `frontend/packages/labs/build-lab`:

```sh
yarn dev
```

The standalone Vite app runs at `http://localhost:5173`.

## Prototype boundaries

Blockly serialization is the in-memory source of truth for the supported
events and the prototype runtime. Project persistence, asset storage, data
services, and the production execution model are out of scope.
