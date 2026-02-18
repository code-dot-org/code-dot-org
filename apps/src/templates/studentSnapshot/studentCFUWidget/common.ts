import {StatusBucket} from './types';

export const statusBucketsMap: Record<
  StatusBucket,
  {label: string; iconName: string}
> = {
  correct: {label: 'Correct', iconName: 'check'},
  partially_correct: {
    label: 'Partially Correct',
    iconName: 'circle-half-stroke',
  },
  incorrect: {label: 'Incorrect', iconName: 'xmark'},
  incomplete: {label: 'Incomplete', iconName: 'empty-set'},
};
