import {shareLab2Project} from '@cdo/apps/lab2/header/lab2HeaderShare';
import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {showFinishDialog} from '@cdo/apps/lab2/views/dialogs/finishDialogs/showFinishDialog';

jest.mock('@cdo/apps/lab2/header/lab2HeaderShare', () => ({
  shareLab2Project: jest.fn(),
}));
jest.mock(
  '@cdo/apps/lab2/views/dialogs/finishDialogs/showFinishDialog',
  () => ({
    ...jest.requireActual(
      '@cdo/apps/lab2/views/dialogs/finishDialogs/showFinishDialog'
    ),
    showFinishDialog: jest.fn(),
  })
);
jest.mock('@cdo/apps/code-studio/progressReduxSelectors', () => ({
  nextLevelId: () => undefined,
}));

describe('continueOrFinishLesson', () => {
  // A validated level on the last level of its unit; the success report
  // is someone else's.
  const state = (finishDialog: string | undefined) => ({
    lab: {
      levelProperties: {
        appName: 'spritelab2',
        finishUrl: '/done',
        finishDialog,
      },
      validationState: {hasConditions: true},
    },
  });
  const finish = (finishDialog: string | undefined) =>
    continueOrFinishLesson()(
      jest.fn(),
      () => state(finishDialog) as never,
      undefined
    );

  afterEach(() => jest.clearAllMocks());

  it('shows a finish dialog of its own and stays on the level', () => {
    finish('hoai2026');
    expect(showFinishDialog).toHaveBeenCalledWith('hoai2026');
    expect(shareLab2Project).not.toHaveBeenCalled();
  });

  it('leaves the share dialog finish variants to the share dialog', () => {
    finish('hoai2025');
    expect(shareLab2Project).toHaveBeenCalledWith('hoai2025', '/done');
    expect(showFinishDialog).not.toHaveBeenCalled();
  });
});
