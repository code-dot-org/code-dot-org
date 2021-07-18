import React from 'react';
import PropTypes from 'prop-types';
import {OAuthSectionTypes} from '@cdo/apps/lib/ui/accounts/constants';
import ManageStudentsPage from './ManageStudentsPage';
import SyncOmniAuthSectionControl from '@cdo/apps/lib/ui/SyncOmniAuthSectionControl';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';

import {gql, useQuery} from '@apollo/client';
import {
  blankStudentTransfer,
  blankStudentTransferStatus
} from './manageStudentsTypes';

/**
 * Note: including `isEditing` in this query causes this whole component
 * to re-render when we toggle that value for a single student since it
 * technically modifies the result of this whole query.
 */
export const GET_SECTION = gql`
  query GetSection($sectionId: ID!) {
    section(id: $sectionId) {
      id
      code
      name
      loginType
      students {
        id
        name
        username
        email
        age
        gender
        secretWords
        secretPicturePath
        hasEverSignedIn
        userType
        isEditing @client
      }
    }
  }
`;

const ManageStudents = ({sectionId, studioUrlPrefix}) => {
  const {data, loading, error} = useQuery(GET_SECTION, {
    variables: {sectionId: sectionId}
  });
  if (loading) {
    return <Spinner />;
  }
  if (error) {
    return <p>ERROR: {error.message}</p>;
  }
  if (!data?.section) {
    return <p>Not found</p>;
  }
  const section = data.section;

  return (
    <React.Fragment>
      <SyncOmniAuthSectionControl
        sectionId={sectionId}
        sectionCode={section.code}
        sectionName={section.name}
        sectionProvider={OAuthSectionTypes[section.loginType]}
      />
      <ManageStudentsPage
        studioUrlPrefix={studioUrlPrefix}
        sectionId={section.id}
        sectionCode={section.code}
        sectionName={section.name}
        studentData={section.students}
        loginType={section.loginType}
        addStatus={{}}
        transferData={{...blankStudentTransfer}}
        transferStatus={{...blankStudentTransferStatus}}
      />
    </React.Fragment>
  );
};
ManageStudents.propTypes = {
  sectionId: PropTypes.number.isRequired,
  studioUrlPrefix: PropTypes.string.isRequired
};

export default ManageStudents;
