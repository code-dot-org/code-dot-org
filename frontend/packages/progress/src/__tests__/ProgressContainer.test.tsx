import {DashboardApiClient} from '@code-dot-org/core/api';
import {configureStore} from '@reduxjs/toolkit';
import {act, render} from '@testing-library/react';
import {useEffect} from 'react';
import {Provider} from 'react-redux';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import ProgressContainer, {useProgressManager} from '../ProgressContainer';
import type ProgressManager from '../ProgressManager';
import progressSlice, {
  initProgress,
  setCurrentLessonId,
} from '../redux/progressSlice';
import {initPayload, lessonData} from '../redux/__tests__/fixtures';
import type {Condition, Validation} from '../types';
import {Validator} from '../types';

class SetValidator extends Validator {
  met = new Set<string>();
  cleared: boolean[] = [];
  shouldCheckConditions() {
    return true;
  }
  shouldCheckNextConditionsOnly() {
    return false;
  }
  checkConditions() {}
  conditionsMet(conditions: Condition[]) {
    return conditions.every(c => this.met.has(c.name));
  }
  clear(isChangingLevels?: boolean) {
    this.cleared.push(!!isChangingLevels);
  }
  getValidationResults() {
    return undefined;
  }
}

const validations: Validation[] = [
  {key: 'done', conditions: [{name: 'DONE'}], message: 'Done.', next: true},
];

// A lab: hands the manager its validator, as a real lab would.
let manager: ProgressManager | null = null;
function Lab({validator}: {validator: Validator}) {
  const progressManager = useProgressManager();
  useEffect(() => {
    manager = progressManager;
    progressManager?.setValidator(validator);
  }, [progressManager, validator]);
  return null;
}

function setup({scriptLevel = true} = {}) {
  const store = configureStore({reducer: {progress: progressSlice.reducer}});
  if (scriptLevel) {
    store.dispatch(initProgress(initPayload({currentLevelId: 323})));
    store.dispatch(setCurrentLessonId(lessonData[0].id));
  }
  const validator = new SetValidator();
  const ui = (
    levelId: number,
    props: {overrideValidations?: Validation[]; appType?: string} = {},
  ) => (
    <Provider store={store}>
      <ProgressContainer
        levelId={levelId}
        validations={validations}
        {...props}
        appType={props.appType ?? 'music'}
      >
        <Lab validator={validator} />
      </ProgressContainer>
    </Provider>
  );
  const view = render(ui(323));
  return {store, validator, rerender: view.rerender, ui};
}

let reportMilestone: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  manager = null;
  reportMilestone = vi
    .spyOn(DashboardApiClient.activities, 'reportMilestone')
    .mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ProgressContainer', () => {
  it('mirrors the level into the progress slice on mount', () => {
    const {store} = setup();
    expect(store.getState().progress.validationState).toMatchObject({
      hasConditions: true,
      satisfied: false,
    });
  });

  it('gives children the manager', () => {
    setup();
    expect(manager).not.toBeNull();
  });

  it('reports success once the validations are satisfied', async () => {
    const {store, validator} = setup();
    validator.met.add('DONE');
    await act(async () => manager!.updateProgress());
    expect(store.getState().progress.validationState).toMatchObject({
      satisfied: true,
      message: 'Done.',
    });
    expect(reportMilestone).toHaveBeenCalledWith(
      expect.objectContaining({levelId: 323, app: 'music'}),
    );
  });

  it('reports with the current appType after a rerender', async () => {
    const {validator, rerender, ui} = setup();
    rerender(ui(323, {appType: 'dance'}));
    validator.met.add('DONE');
    await act(async () => manager!.updateProgress());
    expect(reportMilestone).toHaveBeenCalledWith(
      expect.objectContaining({app: 'dance'}),
    );
  });

  it('does not report outside a script level', async () => {
    const {store, validator} = setup({scriptLevel: false});
    validator.met.add('DONE');
    await act(async () => manager!.updateProgress());
    expect(store.getState().progress.validationState.satisfied).toBe(true);
    expect(reportMilestone).not.toHaveBeenCalled();
  });

  it('resets for a new level, clearing the validator for a level change', () => {
    const {store, validator, rerender, ui} = setup();
    const index = store.getState().progress.validationState.index;
    rerender(ui(324));
    expect(store.getState().progress.validationState.index).toBe(index + 1);
    expect(validator.cleared.at(-1)).toBe(true);
  });

  it('uses override validations in their place', () => {
    const {store, rerender, ui} = setup();
    rerender(ui(323, {overrideValidations: []}));
    expect(store.getState().progress.validationState.hasConditions).toBe(false);
  });
});
