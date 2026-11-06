import {isFinishDialogId} from '@cdo/apps/lab2/views/dialogs/finishDialogs/showFinishDialog';

describe('isFinishDialogId', () => {
  it('knows the dialogs by their own names only', () => {
    expect(isFinishDialogId('hoai2026')).toBe(true);
    expect(isFinishDialogId('hoai2025')).toBe(false);
    expect(isFinishDialogId(undefined)).toBe(false);
    // Inherited object keys are not dialogs.
    expect(isFinishDialogId('constructor')).toBe(false);
    expect(isFinishDialogId('toString')).toBe(false);
  });
});
