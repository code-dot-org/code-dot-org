/**
 * Interface for interacting with a metrics service API.
 */
export default interface MetricsApi {
  sendLogs: (logs: object[]) => Promise<Response>;
}
