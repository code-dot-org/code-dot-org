import {gql} from '@apollo/client';
import React from 'react';

import Section from '@cdo/app/section/[id]/Section';
import client from '@cdo/services/gql/apollo';

export const GET_SECTION_QUERY = gql`
  query ($id: ID!) {
    section(id: $id) {
      name
      id
      grade
      participantType
      sectionInstructors {
        id
        status
        instructorEmail
        instructorName
      }
      primaryInstructor: teacher {
        email
        name
      }
    }
  }
`;

export default async function Page({params}: {params: {id: string}}) {
  const {loading, error, data} = await client.query({
    query: GET_SECTION_QUERY,
    variables: {id: params.id},
  });

  if (loading) return <p>Loading</p>;
  if (error) return `Error! ${error}`;

  return (
    <div>
      <Section section={data.section} />
      <pre>section {JSON.stringify(data.section, null, 2)}</pre>
    </div>
  );
}
