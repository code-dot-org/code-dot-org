import {useMemo} from 'react';

import {
  partialApply,
  StringRecordType,
} from '@cdo/apps/lab2/utils/partialApply';

export type {PAFunctionArgs} from '@cdo/apps/lab2/utils/partialApply';

export function usePartialApply<
  T extends StringRecordType,
  U extends Partial<T>,
  R
>(f: (args: T) => R, initArgs: U) {
  return useMemo(() => partialApply(f, initArgs), [f, initArgs]);
}
