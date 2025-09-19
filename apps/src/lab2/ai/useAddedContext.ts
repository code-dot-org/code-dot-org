import {useState, useCallback} from 'react';

import {UserAddedContextType} from '@cdo/apps/aiTutor/types';

export interface AiTutorAddedContextType {
  userAddedContext?: UserAddedContextType[];
  setUserAddedContext: (context: UserAddedContextType[]) => void;
  removeFromUserAddedContext: (id: string) => void;
  addToUserAddedContext: (
    userAddedContext: Omit<UserAddedContextType, 'id'>
  ) => void;
}

export function useAddedContext(): AiTutorAddedContextType {
  const [userAddedContext, setUserAddedContext] = useState<
    UserAddedContextType[] | undefined
  >(undefined);
  const [nextUserAddedContextId, setNextUserAddedContextId] = useState(1);

  const removeFromUserAddedContext = useCallback(
    (id: string) => {
      if (!userAddedContext) {
        return;
      }
      setUserAddedContext(userAddedContext.filter(item => item.id !== id));
    },
    [userAddedContext]
  );

  const addToUserAddedContext = useCallback(
    (addedContext: Omit<UserAddedContextType, 'id'>) => {
      const newItem = {
        sourceCode: addedContext.sourceCode,
        filename: addedContext.filename,
        lineReference: addedContext.lineReference,
        id: `user-added-context-${nextUserAddedContextId}`,
      };
      setNextUserAddedContextId(nextUserAddedContextId + 1);
      setUserAddedContext(
        userAddedContext ? [...userAddedContext, newItem] : [newItem]
      );
    },
    [nextUserAddedContextId, userAddedContext]
  );

  return {
    userAddedContext,
    setUserAddedContext,
    removeFromUserAddedContext,
    addToUserAddedContext,
  };
}
