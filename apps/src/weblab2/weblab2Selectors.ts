import type {RootState} from '@cdo/apps/types/redux';

export const selectIsAwaitingAcceptReject = (state: RootState) =>
  !!state.lab2Project?.viewingAiTutorVersion &&
  !!state.lab2Project?.aiTutorVersionFiles?.length;
