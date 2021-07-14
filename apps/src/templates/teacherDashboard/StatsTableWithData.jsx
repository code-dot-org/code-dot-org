import PropTypes from 'prop-types';
import React from 'react';
import StatsTable from './StatsTable';
import {gql, useQuery} from '@apollo/client';

export const GET_SECTION = gql`
  query GetSectionStats($sectionId: ID!) {
    section(id: $sectionId) {
      id
      students {
        name
        totalLines
      }
    }
  }
`;

const StatsTableWithData = ({sectionId}) => {
  const {data, error} = useQuery(GET_SECTION, {
    variables: {sectionId: sectionId}
  });
  if (error) {
    return <p>ERROR: {error.message}</p>;
  }
  if (!data) {
    return <p>Not found</p>;
  }

  return <StatsTable section={data.section} scriptName="test" />;
};

StatsTableWithData.propTypes = {
  sectionId: PropTypes.number.isRequired
};

export default StatsTableWithData;
