import {expect} from 'chai'; // eslint-disable-line no-restricted-imports

import {isPredictAnswerLocked} from '@cdo/apps/lab2/redux/predictLevelRedux';
import {RootState} from '@cdo/apps/types/redux';

function buildState({
  hasSubmittedResponse,
  viewAsUserId,
}: {
  hasSubmittedResponse: boolean;
  viewAsUserId: number | null;
}) {
  return {
    predictLevel: {hasSubmittedResponse},
    progress: {viewAsUserId},
  } as unknown as RootState;
}

describe('predictLevelRedux isPredictAnswerLocked', () => {
  it('is locked once the user has submitted a response', () => {
    const state = buildState({hasSubmittedResponse: true, viewAsUserId: null});
    expect(isPredictAnswerLocked(state)).to.be.true;
  });

  it('is unlocked for a student who has not submitted their own answer', () => {
    const state = buildState({hasSubmittedResponse: false, viewAsUserId: null});
    expect(isPredictAnswerLocked(state)).to.be.false;
  });

  it('is locked when a teacher is viewing a student, even with no submission', () => {
    const state = buildState({hasSubmittedResponse: false, viewAsUserId: 99});
    expect(isPredictAnswerLocked(state)).to.be.true;
  });
});
