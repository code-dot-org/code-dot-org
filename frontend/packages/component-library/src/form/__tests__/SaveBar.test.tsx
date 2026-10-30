import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {vi} from 'vitest';

import {FormProvider, useFormDispatch} from '../FormContext';
import SaveBar from '../SaveBar';

// Drives the shared form state into a given status, then renders the SaveBar.
function Harness({
  onSave,
  drive,
}: {
  onSave: () => void;
  drive?: (dispatch: ReturnType<typeof useFormDispatch>) => void;
}) {
  return (
    <FormProvider initialValues={{name: 'Ada'}}>
      <Driver drive={drive} />
      <SaveBar onSave={onSave} />
    </FormProvider>
  );
}

function Driver({
  drive,
}: {
  drive?: (dispatch: ReturnType<typeof useFormDispatch>) => void;
}) {
  const dispatch = useFormDispatch();
  return (
    <button onClick={() => drive?.(dispatch)} type="button">
      drive
    </button>
  );
}

describe('Design System - SaveBar', () => {
  it('is empty while the form is idle', () => {
    render(<Harness onSave={vi.fn()} />);
    expect(screen.queryByText('You’ve made some changes.')).toBeNull();
    expect(screen.queryByRole('button', {name: 'Save changes'})).toBeNull();
  });

  it('shows the dirty state and calls onSave', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <Harness
        onSave={onSave}
        drive={dispatch =>
          dispatch({type: 'edit', field: 'name', value: 'Grace'})
        }
      />,
    );

    await user.click(screen.getByRole('button', {name: 'drive'}));
    expect(screen.getByText('You’ve made some changes.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'Save changes'}));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('disables the button and shows saving copy while saving', async () => {
    const user = userEvent.setup();
    render(
      <Harness
        onSave={vi.fn()}
        drive={dispatch => {
          dispatch({type: 'edit', field: 'name', value: 'Grace'});
          dispatch({type: 'saveStarted'});
        }}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'drive'}));
    const button = screen.getByRole('button', {name: 'Saving…'});
    expect(button).toBeDisabled();
  });

  it('renders form-level errors without a nested live region', async () => {
    const user = userEvent.setup();
    render(
      <Harness
        onSave={vi.fn()}
        drive={dispatch => {
          dispatch({type: 'edit', field: 'name', value: 'Grace'});
          dispatch({type: 'saveStarted'});
          dispatch({
            type: 'saveFailed',
            fieldErrors: {},
            formErrors: ['Name is taken'],
          });
        }}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'drive'}));
    expect(screen.getByText('Name is taken')).toBeInTheDocument();
    // The bar itself is the single polite live region; no nested alert.
    const region = screen.getByRole('region', {name: 'Save status'});
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('sizes the save button from the form-level size, defaulting to medium', async () => {
    const user = userEvent.setup();
    const drive = (dispatch: ReturnType<typeof useFormDispatch>) =>
      dispatch({type: 'edit', field: 'name', value: 'Grace'});

    const {rerender} = render(<Harness onSave={vi.fn()} drive={drive} />);
    await user.click(screen.getByRole('button', {name: 'drive'}));
    expect(
      screen.getByRole('button', {name: 'Save changes'}).className,
    ).toMatch(/sizeMedium/);

    rerender(
      <FormProvider initialValues={{name: 'Ada'}} size="l">
        <Driver drive={drive} />
        <SaveBar onSave={vi.fn()} />
      </FormProvider>,
    );
    await user.click(screen.getByRole('button', {name: 'drive'}));
    expect(
      screen.getByRole('button', {name: 'Save changes'}).className,
    ).toMatch(/sizeLarge/);
  });

  it('applies custom labels', async () => {
    const user = userEvent.setup();
    render(
      <FormProvider initialValues={{name: 'Ada'}}>
        <Driver
          drive={dispatch =>
            dispatch({type: 'edit', field: 'name', value: 'Grace'})
          }
        />
        <SaveBar
          onSave={vi.fn()}
          labels={{dirty: 'Unsaved edits', save: 'Apply', region: 'Editor'}}
        />
      </FormProvider>,
    );

    await user.click(screen.getByRole('button', {name: 'drive'}));
    expect(screen.getByText('Unsaved edits')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Apply'})).toBeInTheDocument();
    expect(screen.getByRole('region', {name: 'Editor'})).toBeInTheDocument();
  });
});
