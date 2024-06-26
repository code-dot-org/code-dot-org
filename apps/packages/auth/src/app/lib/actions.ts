'use server';

//import {signIn} from '@cdo/auth';

export async function authenticate(_currentState: unknown, formData: FormData) {
  try {
    console.log('credentials', formData);
  } catch (error) {
    if (error) {
      // eslint-disable-next-line
      switch ((error as any).type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
