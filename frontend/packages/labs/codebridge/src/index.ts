// Public entry for @code-dot-org/codebridge.
//
// Codebridge is the runtime-agnostic multi-file IDE shell (file browser, tabs,
// editor, console, backpack) that consuming labs — Python Lab, later Web Lab 2 —
// build on. It layers on the base @code-dot-org/lab framework: `CodebridgeLab`
// specializes `LabWithSources` to a `MultiFileSource`.
//
// See docs/port-plan.md for the port sequence. This barrel grows as the shell
// lands.

export {default as CodebridgeLab, STARTOVER_CODEBRIDGE_MESSAGE} from './CodebridgeLab';
export type {CodebridgeLabProps} from './CodebridgeLab';

export * from './constants';
export * from './components';
export * from './hooks';
export * from './utils';

export * from './redux';
