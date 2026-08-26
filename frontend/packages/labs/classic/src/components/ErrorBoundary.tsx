import type {ReactNode} from 'react';
import {Component, type ErrorInfo} from 'react';

/** Render-time controls handed to a function fallback. */
interface ErrorBoundaryFallbackProps {
  /**
   * Clears the boundary's error state and re-renders its children. Pair with
   * {@link ErrorBoundaryProps.onReset} to also reset the upstream error source
   * (e.g. failed react-query queries) so the retry actually refetches.
   */
  reset: () => void;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  /**
   * The view to render once an error is caught. A static node, or a function
   * given a {@link ErrorBoundaryFallbackProps.reset} to retry in place.
   */
  fallback: ReactNode | ((props: ErrorBoundaryFallbackProps) => ReactNode);
  /** Called when an error is caught, e.g. to report telemetry. */
  onError?: (error: Error, componentStack: string) => void;
  /** Called when the boundary is reset, before its children re-render. */
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * A generic React Error Boundary component that can be used to catch errors
 * thrown anywhere within its child components. Renders the provided fallback
 * view if an error occurs, and calls the onError() callback.
 *
 * Note that this will not catch errors thrown inside async functions/Promises;
 * bridge those into the boundary by throwing them during render (see
 * `useThrowIfPageError`).
 */
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError() {
    return {hasError: true};
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info.componentStack || '');
  }

  private reset = () => {
    this.props.onReset?.();
    this.setState({hasError: false});
  };

  render() {
    if (this.state.hasError) {
      const {fallback} = this.props;
      return typeof fallback === 'function'
        ? fallback({reset: this.reset})
        : fallback;
    }

    return this.props.children;
  }
}
