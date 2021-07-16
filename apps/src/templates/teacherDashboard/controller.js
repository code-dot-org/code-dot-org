import {ApolloClient, InMemoryCache, makeVar} from '@apollo/client';

export const client = new ApolloClient({
  uri: 'http://localhost-studio.code.org:3000/graphql',
  cache: new InMemoryCache({
    typePolicies: {
      User: {
        fields: {
          isEditing: {
            read(_, {readField}) {
              const studentId = readField('id');
              return !!currentEditingStudentsVar()[studentId];
            }
          }
        }
      }
    }
  })
});

export const currentEditingStudentsVar = makeVar({});
