import {ApolloClient, createHttpLink, InMemoryCache} from '@apollo/client';
import {setContext} from '@apollo/client/link/context';

import {auth} from '@cdo/app/auth';

const httpLink = createHttpLink({
  uri: 'http://localhost-studio.code.org:3000/graphql',
});

const authLink = setContext(async (_, {headers}) => {
  const token = (await auth())?.user?.token;

  console.log(`using`, token);

  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? token : '',
    },
  };
});

export default new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
});
