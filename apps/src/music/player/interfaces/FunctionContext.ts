/**
 * Describes a function invocation a sound was played in.
 */
export interface FunctionContext {
  /** Name of the function */
  name: string;
  /** Unique ID corresponding to each invocation */
  uniqueInvocationId: number;
}
