import {Visibility} from '../../types';

export const isVisible = (visibility: Visibility) =>
  visibility !== Visibility.HIDDEN;
export const isDisabled = (visibility: Visibility) =>
  visibility === Visibility.READONLY;
