# Build Lab architecture

Build Lab has one React root with four editor views: Build, Design, Create, and
Data. The editor state is serialized as a `BuildLabProject` document. In
Studio, that document is stored in the channel's existing `main.json` source
through `DashboardApiClient.sources`; the standalone entrypoint uses local
storage with the same document format. Studio saves include the source version
returned by the load request and queue writes in order, matching the existing
Lab2 source-save contract and preventing stale completion callbacks from
reporting an older edit as the latest save.

Blockly workspace serialization owns the behavior model. The Design view adds
supported click handlers to the workspace and derives its event cards from the
same blocks. The interpreter in `runtime.ts` executes a cloned workspace
against a separate preview state, so running a project does not mutate the
authored design.

The current persistence boundary is deliberately narrow. Asset data is stored
as data URLs in the project document, and the runtime supports the small block
vocabulary implemented by `BlocklyWorkspace`. A production asset service and a
larger execution engine can replace those internals without changing the
editor-to-source contract. Studio's `/view` route loads the same document with
the editor surface disabled, so the Share control can copy a real preview URL;
standalone local-storage projects remain local to the current browser.

Studio project creation is separate from document persistence: the Studio
route creates an owned channel through the dashboard API, then the mounted lab
creates the initial `main.json` source through the normal version-aware source
save path.
