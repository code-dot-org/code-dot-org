import React, {createContext, useContext, useState, ReactNode} from 'react';

const DropdownContext = createContext({
  activeDropdownName: null as string | null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  setActiveDropdownName: (name: string) => {},
});

export const useDropdownContext = () => useContext(DropdownContext);

export const DropdownProvider: React.FC<{children: ReactNode}> = ({
  children,
}) => {
  const [activeDropdownName, setActiveDropdownName] = useState<string | null>(
    null
  );

  return (
    <DropdownContext.Provider
      value={{activeDropdownName, setActiveDropdownName}}
    >
      {children}
    </DropdownContext.Provider>
  );
};
