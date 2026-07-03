import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';

import type {ComponentSizeXSToL} from '@/common/types';

import {
  createFormState,
  fieldError,
  formReducer,
  type FormAction,
  type FormState,
  type FormValues,
} from './formReducer';

/** Form-level defaults every control in the form reads for consistent sizing. */
export interface FormOptions {
  /** Default control size for the whole form; per-control `size` still wins. */
  size: ComponentSizeXSToL;
}

const DEFAULT_OPTIONS: FormOptions = {size: 'm'};

// Separate contexts so a dispatch-only component doesn't re-render when values change.
const FormStateContext = createContext<FormState | null>(null);
const FormDispatchContext = createContext<Dispatch<FormAction> | null>(null);
// Options are set once at the provider and never change; a plain default keeps
// useFormOptions() usable outside a FormProvider (e.g. a standalone SaveBar).
const FormOptionsContext = createContext<FormOptions>(DEFAULT_OPTIONS);

export function FormProvider({
  initialValues,
  size = DEFAULT_OPTIONS.size,
  children,
}: {
  initialValues: FormValues;
  /**
   * Default size for the form's controls. Threaded to fields and the SaveBar via
   * {@link useFormOptions} so a form-heavy layout sizes consistently in one place;
   * a per-control `size` prop still overrides it.
   */
  size?: ComponentSizeXSToL;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(
    formReducer,
    initialValues,
    createFormState,
  );
  return (
    <FormOptionsContext.Provider value={{size}}>
      <FormStateContext.Provider value={state}>
        <FormDispatchContext.Provider value={dispatch}>
          {children}
        </FormDispatchContext.Provider>
      </FormStateContext.Provider>
    </FormOptionsContext.Provider>
  );
}

/**
 * Form-level defaults (currently `size`) set on the {@link FormProvider}. A
 * control reads this to pick its default size while still allowing a per-control
 * override. Returns the defaults even outside a provider.
 */
export function useFormOptions(): FormOptions {
  return useContext(FormOptionsContext);
}

export function useFormState(): FormState {
  const state = useContext(FormStateContext);
  if (!state) {
    throw new Error('useFormState must be used within a FormProvider');
  }
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
  /** True when the field has errors; spread onto the control's input as
   * `aria-invalid` so a screen reader reports the invalid state. */
  ariaInvalid: boolean;
  onChange: (value: string) => void;
}

export function useField(field: string): FieldBinding {
  const state = useFormState();
  const dispatch = useFormDispatch();
  const errors = fieldError(state, field);
  return {
    value: state.values[field] ?? '',
    errors,
    ariaInvalid: errors.length > 0,
    onChange: value => dispatch({type: 'edit', field, value}),
  };
}
