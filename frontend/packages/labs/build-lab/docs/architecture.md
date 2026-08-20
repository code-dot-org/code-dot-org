# Build Lab architecture

The prototype has one React root with four editor views: Build, Design, Create,
and Data. Blockly workspace serialization owns the supported behavior model.
The Design view writes supported click handlers into that serialization and
reads those handlers back for its event cards. Run interprets the same small
block vocabulary against a cloned preview state.

The design, asset, and data models are intentionally in-memory. A production
lab needs a persisted project schema and a runtime that is not coupled to the
React editor state.
