/**
 * The lab metrics reporter: a base class wrapping observability
 * (logger / metrics / recordError). Labs may extend it for lab-specific
 * reporting (see music's LabMusicMetricsReporter), so it is lab-facing — NOT
 * part of the host shell in @code-dot-org/lab/host.
 */
export {default as LabMetricsReporter} from './LabMetricsReporter';
