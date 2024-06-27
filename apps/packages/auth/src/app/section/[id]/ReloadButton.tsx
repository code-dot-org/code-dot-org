'use client';
import React from 'react';

import {GET_SECTION_QUERY} from '@cdo/app/section/[id]/page';
import {Button} from '@cdo/component-library';
import client from '@cdo/services/gql/apollo';

export default function ReloadButton() {
  const reload = () => {
    client.query({
      query: GET_SECTION_QUERY,
      variables: {id: 16},
    });
  };

  return (
    <div>
      <Button onClick={reload} text={`reload`} />
    </div>
  );
}
