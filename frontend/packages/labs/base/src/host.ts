/**
 * Host-side shell for running labs inside a platform (Studio, apps backport).
 * Labs must NOT import from this entrypoint — use @code-dot-org/lab/contexts.
 */
export {default as Lab} from './components/Lab';
export type {LabProps} from './components/Lab';
export {default as ErrorBoundary} from './components/ErrorBoundary';
export {default as Loading} from './components/Loading';
export {default as LabMetricsReporter} from './LabMetricsReporter';
