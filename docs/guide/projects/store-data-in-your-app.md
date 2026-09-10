---
title: Store data in your app
description: Save and retrieve data in App Lab and Game Lab so it persists between sessions.
type: concept
---

App Lab and Game Lab can save data on CodeAI's servers so it persists between sessions. Anyone who runs your shared project reads from and writes to the same data.

**Applies to:** App Lab, Game Lab.

## Two storage methods

- **Tables** work like a spreadsheet. Each row is a record with named columns. Use `createRecord`, `readRecords`, `updateRecord`, and `deleteRecord`.
- **Key-value pairs** store a single value under a name. Use `setKeyValue` to save and `getKeyValue` to retrieve.

## Rate limits

Each project has a rate limit on data requests. If your app makes too many requests in a short time, some are temporarily rejected. Batch your reads and avoid writing on every keystroke.

## Pre-loaded datasets

App Lab includes ready-made datasets (weather, movies, sports, and others) that you can browse and import from the data panel. These are read-only reference data maintained by CodeAI.

## Further reading

- [Look up a block or function](/guide/labs/working-in-a-level/look-up-a-block/)
- [Sharing and publishing](/guide/projects/sharing-and-publishing/)
