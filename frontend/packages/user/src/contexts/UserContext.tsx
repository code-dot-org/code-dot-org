import React, {PropsWithChildren, useEffect, useState, createContext, useContext} from 'react';

/**
 * Describes the state of the user.
 */
export interface UserContent {
  userId?: number;
  userType?: 'student' | 'teacher';
}

/**
 * The current lab application metadata.
 */
const UserContext = createContext<UserContent>({});

/**
 * This hook returns the user state.
 */
export const useUser = () => {
  return useContext(UserContext);
};

/**
 * Holds the user state.
 */
export const UserProvider: React.FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [userType, setUserType] = useState<'student' | 'teacher' | undefined>(undefined);

  useEffect(() => {
    // Query the signed in user via API and establish that user.
    setUserId(1);
    setUserType('teacher');
  }, [setUserId]);

  return (
    <UserContext.Provider value={{
      userId,
      userType,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
