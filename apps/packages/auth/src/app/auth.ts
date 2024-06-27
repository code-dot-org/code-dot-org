import md5 from 'md5';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
export const authOptions = {
  // Configure one or more authentication providers
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Credentials',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        emailAddress: {label: 'Email Address', type: 'text'},
        password: {label: 'Password', type: 'password'},
      },
      authorize: async credentials => {
        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid.
        // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
        // You can also use the `req` object to obtain additional parameters
        // (i.e., the request IP address)
        console.log(`recevied`, credentials);
        const res = await fetch(
          'http://localhost-studio.code.org:3000/users/sign_in',
          {
            method: 'POST',
            body: JSON.stringify({
              user: {
                hashed_email: md5(credentials!['email']),
                password: credentials!['password'],
              },
            }),
            headers: {'Content-Type': 'application/json'},
          }
        );
        const user = {
          ...(await res.json()),
          token: res.headers.get('Authorization'),
        };

        // If no error and we have user data, return it
        if (res.ok && user) {
          console.log(user);
          return user;
        }
        // Return null if user data could not be retrieved
        return null;
      },
    }),
    // ...add more providers here
  ],
  callbacks: {
    async jwt({token, user}) {
      token.serverToken = user.token;
      console.log('jwt', user, token);
      return {...token, ...user};
    },
    async session({session, token}) {
      session.user.token = token.serverToken;
      console.log('session', session, token);
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

export const {handlers, signIn, signOut, auth} = NextAuth(authOptions);
