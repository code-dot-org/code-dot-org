import React, {ReactNode} from 'react';

import honeybadger from '@cdo/apps/common/honeybadger';
import DCDO from '@cdo/apps/dcdo';
import {ErrorUI} from '@cdo/apps/lab2/views/ErrorFallbackPage';
import {createUuid} from '@cdo/apps/utils';

interface HoneybadgerErrorBoundaryProps {
  children?: ReactNode;
}

interface HoneybadgerErrorBoundaryState {
  hasError: boolean;
  traceId?: string;
}

class HoneybadgerErrorBoundary extends React.Component<
  HoneybadgerErrorBoundaryProps,
  HoneybadgerErrorBoundaryState
> {
  constructor(props: HoneybadgerErrorBoundaryProps) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError() {
    return {hasError: true, traceId: createUuid()};
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (DCDO.get('honeybadger-frontend', false)) {
      honeybadger.notify(error, {
        context: {
          componentStack: info?.componentStack,
          traceId: this.state.traceId,
        },
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorUI traceId={this.state.traceId} />;
    }

    return this.props.children;
  }
}

export default HoneybadgerErrorBoundary;
