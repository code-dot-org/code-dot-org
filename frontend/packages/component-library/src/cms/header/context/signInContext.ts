import {createContext} from 'react';

export type SignInState = 'loading' | 'signedIn' | 'signedOut' | 'error';

const SignInContext = createContext<SignInState>('loading');

export default SignInContext;
