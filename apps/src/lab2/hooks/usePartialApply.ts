import {useMemo} from 'react';

import {
  partialApply,
  StringRecordType,
} from '@cdo/apps/lab2/utils/partialApply';

// re-export the PAFunctionArgs type from partialApply, so we can import both the hook and
// the helper satisfies type in one shot
export type {PAFunctionArgs} from '@cdo/apps/lab2/utils/partialApply';

export function usePartialApply<
  T extends StringRecordType,
  U extends Partial<T>,
  R
>(f: (args: T) => R, initArgs: U) {
  return useMemo(() => partialApply(f, initArgs), [f, initArgs]);
}
