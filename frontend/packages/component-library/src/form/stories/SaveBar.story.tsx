import type {Meta, StoryObj} from '@storybook/react-vite';
import {useEffect} from 'react';

import {FormProvider, useFormDispatch, type FormAction} from '../index';
import SaveBar from '../SaveBar';

export default {
  title: 'DesignSystem/Form/SaveBar',
  component: SaveBar,
} as Meta<typeof SaveBar>;

type Story = StoryObj<typeof SaveBar>;

// Dispatches a fixed sequence of actions once, so a story can render the bar in
// a specific state for a deterministic snapshot.
function Drive({actions}: {actions: FormAction[]}) {
  const dispatch = useFormDispatch();
  useEffect(() => {
    actions.forEach(dispatch);
  }, [actions, dispatch]);
  return null;
}

function Frame({
  actions,
  labels,
}: {
  actions: FormAction[];
  labels?: React.ComponentProps<typeof SaveBar>['labels'];
}) {
  return (
    <FormProvider initialValues={{name: 'Ada'}}>
      <Drive actions={actions} />
      <SaveBar onSave={() => undefined} labels={labels} />
    </FormProvider>
  );
}

/** Dirty: the user has unsaved edits. */
export const Dirty: Story = {
  render: () => (
    <Frame actions={[{type: 'edit', field: 'name', value: 'Grace'}]} />
  ),
};

/** Saving: the request is in flight; the button is disabled. */
export const Saving: Story = {
  render: () => (
    <Frame
      actions={[
        {type: 'edit', field: 'name', value: 'Grace'},
        {type: 'saveStarted'},
      ]}
    />
  ),
};

/** Error: the save failed with form-level messages. */
export const WithFormError: Story = {
  render: () => (
    <Frame
      actions={[
        {type: 'edit', field: 'name', value: 'Grace'},
        {type: 'saveStarted'},
        {
          type: 'saveFailed',
          fieldErrors: {},
          formErrors: ['That name is already taken.'],
        },
      ]}
    />
  ),
};

/** Custom copy via the `labels` prop. */
export const CustomLabels: Story = {
  render: () => (
    <Frame
      actions={[{type: 'edit', field: 'name', value: 'Grace'}]}
      labels={{dirty: 'Unsaved edits', save: 'Apply changes'}}
    />
  ),
};
