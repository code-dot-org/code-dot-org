import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';

import {
  createFormState,
  fieldError,
  formReducer,
  type FormAction,
  type FormState,
  type FormValues,
} from './formReducer';

// Separate contexts so a dispatch-only component doesn't re-render when values change.
const FormStateContext = createContext<FormState | null>(null);
const FormDispatchContext = createContext<Dispatch<FormAction> | null>(null);

export function FormProvider({
  initialValues,
  children,
}: {
  initialValues: FormValues;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(
    formReducer,
    initialValues,
    createFormState,
  );
  return (
    <FormStateContext.Provider value={state}>
      <FormDispatchContext.Provider value={dispatch}>
        {children}
      </FormDispatchContext.Provider>
    </FormStateContext.Provider>
  );
}

export function useFormState(): FormState {
  const state = useContext(FormStateContext);
  if (!state)
    throw new Error('useFormState must be used within a FormProvider');
  return state;
}

export function useFormDispatch(): Dispatch<FormAction> {
  const dispatch = useContext(FormDispatchContext);
  if (!dispatch) {
    throw new Error('useFormDispatch must be used within a FormProvider');
  }
  return dispatch;
}

export interface FieldBinding {
  value: string;
  errors: string[];
  onChange: (value: string) => void;
}

export function useField(field: string): FieldBinding {
  const state = useFormState();
  const dispatch = useFormDispatch();
  return {
    value: state.values[field] ?? '',
    errors: fieldError(state, field),
    onChange: value => dispatch({type: 'edit', field, value}),
  };
}
