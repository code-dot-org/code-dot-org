import {
  createContext,
  useCallback,
  useContext,
  useState,
  FunctionComponent,
  ReactNode,
} from 'react';

/**
 * Dropdown context is used to manage that only one of CheckboxDropdowns is open at a time.
 */
const DropdownContext = createContext({
  activeDropdownName: '',
  /**
   * This is a dummy function to satisfy the type checker
   * */
  setActiveDropdownName: (name: string) => {
    void name;
  },
});

export const useDropdownContext = () => useContext(DropdownContext);

// Call from inside CustomDropdown's children: CustomDropdown owns the provider.
// Focus returns to the trigger unless the option's handler moved it elsewhere.
export const useCloseDropdownMenu = (name: string) => {
  const {setActiveDropdownName} = useDropdownContext();

  return useCallback(
    (option: HTMLElement) => {
      setActiveDropdownName('');
      const focused = document.activeElement;
      if (!focused || focused === document.body || focused === option) {
        document.getElementById(`${name}-dropdown-button`)?.focus();
      }
    },
    [name, setActiveDropdownName],
  );
};

export const DropdownProviderWrapper: FunctionComponent<{
  children: ReactNode;
}> = ({children}) => {
  const [activeDropdownName, setActiveDropdownName] = useState('');

  return (
    <DropdownContext.Provider
      value={{activeDropdownName, setActiveDropdownName}}
    >
      {children}
    </DropdownContext.Provider>
  );
};
