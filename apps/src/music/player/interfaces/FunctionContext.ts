/**
 * Describes a function invocation a sound was played in.
 */
export interface FunctionContext {
  /** Name of the function.  Possibly localized. */
  name: string;
  /** Procedure ID of the function. */
  procedureID?: string;
  /** Unique ID corresponding to each invocation */
  uniqueInvocationId: number;
}
