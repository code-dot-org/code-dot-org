// Stub for @cdo/apps/metrics/AnalyticsReporter.
//
// The real module constructs a reporter at import time, which reaches
// StatsigReporter (CJS-in-ESM, same failure as util/experiments) and reads
// process.env. It would also send real Statsig traffic from a dev machine.
//
// TODO: drop this once the feature reports through core's analytics plugin.

const analyticsReporter = {
  sendEvent(name: string, payload?: Record<string, unknown>): void {
    console.log('[analytics]', name, payload);
  },
};

export default analyticsReporter;
