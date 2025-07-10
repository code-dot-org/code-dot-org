import React, {createContext, useContext, useState} from 'react';

// Is this needed?  Dragging is much simpler in this older example:
// https://v9.reactflow.dev/examples/drag-and-drop/

interface DnDContextType {
  type: string | null;
  setType: React.Dispatch<React.SetStateAction<string | null>>;
}

type DnDContextValue = [DnDContextType['type'], DnDContextType['setType']];

const DnDContext = createContext<DnDContextValue>([null, _ => {}]);

export const DnDProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [type, setType] = useState<string | null>(null);

  return (
    <DnDContext.Provider value={[type, setType]}>
      {children}
    </DnDContext.Provider>
  );
};

export default DnDContext;

export const useDnD = () => {
  return useContext(DnDContext);
};
