import PropTypes from 'prop-types';
import React from 'react';
import StatsTable from './StatsTable';
import {gql, useQuery} from '@apollo/client';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';

export const GET_SECTION = gql`
  query GetSectionStats($sectionId: ID!) {
    section(id: $sectionId) {
      id
      students {
        name
        progress {
          totalLinesOfCode
          levelsPassed
        }
      }
    }
  }
`;

const StatsTableWithData = ({sectionId}) => {
  const {data, loading, error} = useQuery(GET_SECTION, {
    variables: {sectionId: sectionId}
  });
  if (loading) {
    return <Spinner />;
  }
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
