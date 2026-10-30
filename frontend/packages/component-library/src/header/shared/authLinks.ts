/**
 * Auth routes shared by the signed-out bar buttons (SignedOutUserButtons) and
 * the hamburger drawer's signed-out section, so the two stay in sync.
 */
export const AUTH_LINKS = {
  signIn: '/users/sign_in',
  createAccount: '/users/sign_up/account_type',
} as const;
