import {createContext} from 'react';

export enum OneTrustCookieGroup {
  StrictlyNecessary = 'C0001',
  Performance = 'C0002',
  Functional = 'C0003',
  Targeting = 'C0004',
  SocialMedia = 'C0005',
  Marketing = 'C0008',
  MiscBlocked = 'C0012',
}

export const OneTrustCookieGroupSet: {
  [categoryId: string]: OneTrustCookieGroup;
} = Object.values(OneTrustCookieGroup).reduce((accumulator, cookieValue) => {
  accumulator[cookieValue] = cookieValue;

  return accumulator;
}, Object.create({}));

export interface OneTrustContextType {
  allowedCookies: Set<OneTrustCookieGroup>;
}

const OneTrustContext = createContext<OneTrustContextType | undefined>(
  undefined,
);

export default OneTrustContext;
