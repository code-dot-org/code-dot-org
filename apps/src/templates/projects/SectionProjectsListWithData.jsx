import PropTypes from 'prop-types';
import React from 'react';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import SectionProjectsList from './SectionProjectsList';
import {gql, useQuery} from '@apollo/client';

export const GET_PROJECTS = gql`
  query GetSectionStats($sectionId: ID!) {
    section(id: $sectionId) {
      id
      students {
        name
        projects {
          name
          channel
          type
          thumbnailUrl
          publishedAt
          updatedAt
        }
      }
    }
  }
`;

const SectionProjectsListWithData = ({sectionId, studioUrlPrefix}) => {
  const {data, loading, error} = useQuery(GET_PROJECTS, {
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

  const projectsData = data.section.students.map(s => {
    return s.projects.map(p => ({studentName: s.name, ...p}));
  });

  return (
    <SectionProjectsList
      projectsData={projectsData.flat()}
      studioUrlPrefix={studioUrlPrefix}
      showProjectThumbnails={true}
    />
  );
};

SectionProjectsListWithData.propTypes = {
  studioUrlPrefix: PropTypes.string,
  sectionId: PropTypes.number
};

export default SectionProjectsListWithData;
