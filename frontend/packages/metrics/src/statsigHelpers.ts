import {getEnvironment, isProductionEnvironment} from './environment';

export const getUserID: () => string | undefined = () => {
  const userIdElement = (typeof document !== 'undefined' ? document.querySelector('script[data-user-id]') : undefined) as (HTMLElement | undefined);
  return userIdElement?.dataset?.userId;
};

export const getUserType: () => string | undefined = () => {
  const userTypeElement = (typeof document !== 'undefined' ? document.querySelector('script[data-user-type') : undefined) as (HTMLElement | undefined);
  return userTypeElement?.dataset?.userType;
};

export const getStableId: () => string | undefined = () => {
  const scriptTag = (typeof document !== 'undefined' ? document.querySelector('script[data-statsig-stable-id]') : undefined) as (HTMLElement | undefined);
  return scriptTag?.dataset?.statsigStableId;
};

export const formatUserId = (userId: string | number) => {
  const userIdString = userId.toString() || 'none';
  if (!userId) {
    return userIdString;
  }

  if (isProductionEnvironment()) {
    return userIdString.padStart(5, '0');
  } else {
    const environment = getEnvironment();
    return `${environment}-${userIdString}`;
  }
};
