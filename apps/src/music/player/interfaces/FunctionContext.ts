/**
 * Describes a function invocation a sound was played in.
 */
export interface FunctionContext {
  /** Name of the function.  Possibly localized. */
  name: string;
  /** ID of the block doing the function call. */
  functionCallBlockId?: string;
  /** Unique ID corresponding to each invocation */
  uniqueInvocationId: number;
}
