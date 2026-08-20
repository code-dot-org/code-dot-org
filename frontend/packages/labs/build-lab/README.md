# @code-dot-org/build-lab

Build Lab is the frontend lab for a unified block-based app and game authoring
experience. It is a standalone Vite lab and can also be lazy-loaded by the
frontend Studio shell.

## Development

From `frontend/packages/labs/build-lab`:

```sh
yarn dev
```

The standalone Vite app runs at `http://localhost:5173`.

## Project storage

The lab stores its project document as JSON in the existing `main.json` source
for a Studio channel. Studio passes the channel ID into the lab, and the lab
uses `DashboardApiClient.sources` for reads and debounced writes. The
standalone app uses a local-storage adapter so the same editor can be exercised
without Rails.

Blockly serialization remains the source of truth for supported behavior. The
Design tab writes event blocks into the workspace, and Run interprets a clone
of that serialized workspace.
