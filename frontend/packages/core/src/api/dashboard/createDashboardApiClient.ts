import type {KyInstance} from 'ky';
import labs from './labs';
import users from './users';

type BoundApiClient<T> = T extends (http: KyInstance) => infer R
  ? R
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends Record<string, any>
    ? {[K in keyof T]: BoundApiClient<T[K]>}
    : T;

function bindApiClient<T>(api: T, kyInstance: KyInstance): BoundApiClient<T> {
  if (typeof api === 'function') {
    return api(kyInstance) as BoundApiClient<T>;
  }
  if (typeof api === 'object' && api !== null) {
    const bound = {} as BoundApiClient<T>;
    for (const [key, value] of Object.entries(api)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (bound as any)[key] = bindApiClient(value, kyInstance);
    }
    return bound;
  }
  return api as BoundApiClient<T>;
}

export function createDashboardApiClient(httpTransport: KyInstance) {
  return {
    labs: bindApiClient(labs, httpTransport),
    users: bindApiClient(users, httpTransport),
  };
}
