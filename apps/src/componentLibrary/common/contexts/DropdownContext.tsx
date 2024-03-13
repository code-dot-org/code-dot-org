import React, {createContext, useContext, useState, ReactNode} from 'react';

const DropdownContext = createContext({
  activeDropdownName: '',
  /**
   * This is a dummy function to satisfy the type checker
   * */
  setActiveDropdownName: (name: string) => {
    return name as unknown as void;
  },
});

export const useDropdownContext = () => useContext(DropdownContext);

export const DropdownProvider: React.FC<{children: ReactNode}> = ({
  children,
}) => {
  const [activeDropdownName, setActiveDropdownName] = useState('');

  return (
    <DropdownContext.Provider
      value={{activeDropdownName, setActiveDropdownName}}
    >
      {children}
    </DropdownContext.Provider>
  );
};
