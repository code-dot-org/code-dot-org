import {DndMonitorListener, useDndMonitor} from '@dnd-kit/core';
import React, {createContext, useContext} from 'react';

import {DragDataType, DropDataType} from './types';

export type DnDDataContextType = {
  dragData?: DragDataType;
  dropData?: DropDataType;
};

export const DndDataContext = createContext<DnDDataContextType | null>(null);

export const useDndDataContext = () => {
  const context = useContext(DndDataContext);
  if (context === null) {
    throw new Error('DND Data Context has not been provided!');
  }
  return context;
};

type DndDataContextProviderType = {
  children: React.ReactNode;
  dndMonitor: DndMonitorListener;
  value: DnDDataContextType;
};

export const DndDataContextProvider = ({
  children,
  dndMonitor,
  value,
}: DndDataContextProviderType) => {
  useDndMonitor(dndMonitor);
  return (
    <DndDataContext.Provider value={value}>{children}</DndDataContext.Provider>
  );
};
