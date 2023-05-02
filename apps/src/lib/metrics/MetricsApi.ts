/**
 * Interface for interacting with a metrics service API.
 */
export interface MetricsApi {
  sendLogs: (logs: object[]) => Promise<Response>;
}
