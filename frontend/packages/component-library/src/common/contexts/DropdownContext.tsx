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

// Call from inside CustomDropdown's children; outside its provider this is a
// no-op. Focus returns to the trigger unless the handler already moved it.
export const useCloseDropdownMenu = () => {
  const {setActiveDropdownName} = useDropdownContext();

  return useCallback(
    (menuItem: HTMLElement) => {
      setActiveDropdownName('');
      const focused = document.activeElement;
      if (!focused || focused === document.body || focused === menuItem) {
        menuItem
          .closest('[data-dropdown-root]')
          ?.querySelector<HTMLElement>('[data-toggle="dropdown"]')
          ?.focus();
      }
    },
    [setActiveDropdownName],
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
