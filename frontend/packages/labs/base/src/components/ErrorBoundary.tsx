import type {ReactNode} from 'react';
import {Component, type ErrorInfo} from 'react';

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
  onError: (error: Error, componentStack: string) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * A generic React Error Boundary component that can be used to catch
 * errors thrown anywhere with its child components. Renders the provided
 * fallback view if an error occurs, and calls the onError() callback.
 *
 * Note that this will not catch errors thrown inside async functions/Promises
 */
export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {hasError: true};
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError(error, info.componentStack || '');
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
