import {gql, useQuery} from '@apollo/client';

export const GET_SECTION = gql`
  query GetSection($sectionId: ID!) {
    section(id: $sectionId) {
      id
      code
      name
      provider
      students {
        id
        name
        username
        email
        age
        gender
        secretWords
        secretPicturePath
        sectionId
        hasEverSignedIn
        userType
        rowType @client
      }
    }
  }
`;
