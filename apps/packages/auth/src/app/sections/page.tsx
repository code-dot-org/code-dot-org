import {gql} from '@apollo/client';
import React from 'react';

import Section from '@cdo/app/sections/Section';
import client from '@cdo/services/gql/apollo';

export const GET_SECTION_QUERY = gql`
  query ($id: ID!) {
    section(id: $id) {
      name
      id
      instructors {
        id
        name
      }
    }
  }
`;

export default async function Page() {
  const {loading, error, data} = await client.query({
    query: GET_SECTION_QUERY,
    variables: {id: 16},
  });

  if (loading) return <p>Loading</p>;
  if (error) return `Error! ${error}`;

  return (
    <div>
      <div>section {JSON.stringify(data)}</div>
      <Section section={undefined} />
    </div>
  );
}
