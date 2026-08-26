import {act, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import lab, {setValidationState} from '@cdo/apps/lab2/lab2Redux';
import {
  ValidationResult,
  ValidationState,
} from '@cdo/apps/lab2/progress/ProgressManager';
import ValidationPanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Validation/ValidationPanel';
import {
  getStore,
  registerReducers,
  restoreRedux,
  stubRedux,
} from '@cdo/apps/redux';

const SKIPPED: ValidationResult = {
  message: 'Painter should end at (3, 3)',
  result: 'SKIP',
};
const PENDING: ValidationResult = {
  message: 'Painter should end at (3, 3)',
  result: 'PENDING',
};

function validationState(
  validationResults?: ValidationResult[]
): ValidationState {
  return {
    hasConditions: true,
    satisfied: false,
    message: null,
    index: 0,
    validationResults,
  };
}

describe('ValidationPanel', () => {
  let store: Store;

  beforeEach(() => {
    stubRedux();
    registerReducers({lab});
    store = getStore();
  });

  afterEach(() => {
    restoreRedux();
    jest.clearAllMocks();
  });

  const panel = (isValidating = false) => (
    <Provider store={store}>
      <ValidationPanel
        onValidate={jest.fn()}
        onStopValidation={jest.fn()}
        isValidating={isValidating}
        isValidateDisabled={false}
      />
    </Provider>
  );

  const liveRegion = () => screen.getByRole('status');
  const resultsTable = () =>
    screen.getByRole('table', {name: 'Validation Results'});

  function setResults(results?: ValidationResult[]) {
    act(() => {
      store.dispatch(setValidationState(validationState(results)));
    });
  }

  it('announces a run starting by swapping the button', async () => {
    setResults();
    const {rerender} = render(panel(false));
    expect(liveRegion()).toHaveTextContent('Validate');

    rerender(panel(true));

    await waitFor(() =>
      expect(liveRegion()).toHaveTextContent('Stop validation')
    );
  });

  // Nothing else moves focus, so losing the button drops the user on the body.
  it('keeps focus on the button across the swap', async () => {
    setResults();
    const {rerender} = render(panel(false));
    const button = screen.getByRole('button');
    button.focus();

    rerender(panel(true));

    await waitFor(() =>
      expect(screen.getByRole('button')).toHaveTextContent('Stop validation')
    );
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('reads the rows out as they land', () => {
    setResults([SKIPPED]);
    render(panel());

    const announced = resultsTable().closest('[aria-live="polite"]');
    expect(announced).not.toBeNull();
    expect(announced).toHaveTextContent('Painter should end at (3, 3)');
    expect(announced).toHaveTextContent('Skip');
  });

  it('names the results table for assistive tech', () => {
    setResults([SKIPPED]);
    render(panel());

    expect(resultsTable()).toBeInTheDocument();
  });

  it('hides the status icon from assistive tech when the result is also written out', () => {
    setResults([SKIPPED]);
    render(panel());

    // The row already says "Skip", so the icon must not repeat it.
    expect(screen.getByText('Skip')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('labels the status icon while a test is pending, when nothing else says so', () => {
    setResults([PENDING]);
    render(panel(true));

    expect(screen.getByRole('img', {name: 'Running'})).toBeInTheDocument();
  });
});
