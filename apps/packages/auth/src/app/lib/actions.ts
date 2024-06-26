'use server';

import md5 from 'md5';

export async function authenticate(_currentState: unknown, formData: FormData) {
  console.log(formData);
  const email = formData.get('email')!.toString();
  try {
    await fetch('http://localhost-studio.code.org:3000/users/sign_in', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: {
          hashed_email: md5(email),
          password: formData.get('password'),
        },
      }),
    })
      .then(res => {
        if (res.ok) {
          console.log(res.headers.get('Authorization'));
          return res.json();
        } else {
          return res.text().then(text => Promise.reject(text));
        }
      })
      .then(json => console.dir(json))
      .catch(err => console.error(err));
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
