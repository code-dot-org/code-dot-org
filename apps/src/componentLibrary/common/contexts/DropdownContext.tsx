import React, {createContext, useContext, useState, ReactNode} from 'react';

const DropdownContext = createContext({
  activeDropdownName: '',
  setActiveDropdownName: (name: string) => {
    console.log(name);
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
