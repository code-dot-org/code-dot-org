import React from 'react';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import SectionProjectsList from './SectionProjectsList';
import {gql, useQuery} from '@apollo/client';
import {
  GetProjects,
  GetProjectsVariables
} from '@cdo/apps/graphql/types/GetProjects';

export const GET_PROJECTS = gql`
  query GetProjects($sectionId: ID!) {
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

const SectionProjectsListWithData = ({
  sectionId,
  studioUrlPrefix
}: SectionProjectsListProps) => {
  const {data, loading, error} = useQuery<GetProjects, GetProjectsVariables>(
    GET_PROJECTS,
    {
      variables: {sectionId: sectionId}
    }
  );

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

interface SectionProjectsListProps {
  studioUrlPrefix?: string;
  sectionId?: string;
}

export default SectionProjectsListWithData;
