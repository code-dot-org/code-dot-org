import {gql} from '@apollo/client';
import Link from "next/link";
import React from 'react';

import client from '@cdo/services/gql/apollo';

export const GET_SECTIONS_QUERY = gql`
  query {
    sections {
      name
      id
    }
  }
`;

export default async function Page({params}: {params: {id: string}}) {
  const {loading, error, data} = await client.query({
    query: GET_SECTIONS_QUERY,
  });

  if (loading) return <p>Loading</p>;
  if (error) return `Error! ${error}`;

  return (
    <>
      <h1>Your Sections</h1>
      <ul>
        {data.sections.map(section => {
          return (
            <li>
              <Link href={`/section/${section.id}`}>{section.name}</Link>
            </li>
          );
        })}
      </ul>
      <div>
        <pre>section {JSON.stringify(data, null, 2)}</pre>
      </div>
    </>
  );
}
