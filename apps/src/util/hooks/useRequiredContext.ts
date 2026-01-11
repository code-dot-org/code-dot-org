import {Context, useContext} from 'react';

/**
 * A custom hook that ensures a context value is present.
 * If the context value is null or undefined, an error is thrown.
 */
export default function useRequiredContext<T>(
  context: Context<T | null>,
  contextName: string
): T {
  const ctx = useContext(context);
  if (!ctx) {
    throw new Error(`${contextName} must be used within a Provider`);
  }
  return ctx;
}
