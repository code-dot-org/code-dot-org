import {Visibility} from '../../types';

export const isHidden = (visibility: Visibility) =>
  visibility === Visibility.HIDDEN;
export const isDisabled = (visibility: Visibility) =>
  visibility === Visibility.READONLY;
