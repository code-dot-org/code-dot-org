import {trace} from '@opentelemetry/api';
import {wrapTracer} from '@opentelemetry/api/experimental';

export default wrapTracer(trace.getTracer('Next.js runtime'));
