import {getEnvironment, isProductionEnvironment} from './environment';

export const getUserID: () => string | undefined = () => {
  const userIdElement = document.querySelector('script[data-user-id]') as (HTMLElement | undefined);
  return userIdElement?.dataset?.userId;
};

export const getUserType: () => string | undefined = () => {
  const userTypeElement = document.querySelector('script[data-user-type') as (HTMLElement | undefined);
  return userTypeElement?.dataset?.userType;
};

export const getStableId: () => string | undefined = () => {
  const scriptTag = document.querySelector('script[data-statsig-stable-id]') as (HTMLElement | undefined);
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
