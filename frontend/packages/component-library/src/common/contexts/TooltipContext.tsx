import React, {createContext, useContext, useState} from 'react';

interface TooltipContextType {
  openTooltipId: string | null;
  setOpenTooltipId: (id: string | null) => void;
}

const TooltipContext = createContext<TooltipContextType | undefined>({
  openTooltipId: null,
  setOpenTooltipId: () => {},
});

export const TooltipProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null);
  return (
    <TooltipContext.Provider value={{openTooltipId, setOpenTooltipId}}>
      {children}
    </TooltipContext.Provider>
  );
};

export const useTooltipContext = () => {
  const ctx = useContext(TooltipContext);
  if (!ctx) {
    //console.log('TooltipContext not found');
    throw new Error('useTooltipContext must be used within TooltipProvider');
  }
  return ctx;
};
