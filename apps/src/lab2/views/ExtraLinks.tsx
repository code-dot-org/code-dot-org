import {BodyTwoText, Heading3} from '@cdo/apps/componentLibrary/typography';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import Button from '@cdo/apps/templates/Button';
import {useFetch} from '@cdo/apps/util/useFetch';
import React, {useState} from 'react';

interface PermissionResponse {
  permissions: string[];
}
const ExtraLinks: React.FunctionComponent = () => {
  const {loading, data} = useFetch('/api/v1/users/current/permissions');
  const [isModalOpen, setIsModalOpen] = useState(false);
  if (loading) {
    return <></>;
  }

  const parsedData = data ? (data as PermissionResponse) : {permissions: []};
  console.log({parsedData});
  // On levelbuilders should see extra links
  if (!parsedData.permissions.includes('levelbuilder')) {
    return <></>;
  }
  console.log('rendering button?');

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        text={'Extra Links'}
        className={'extra-links-button'}
      />
      {isModalOpen && (
        <AccessibleDialog onClose={() => setIsModalOpen(false)}>
          <Heading3>Extra links</Heading3>
          <BodyTwoText>Hello from extra links!</BodyTwoText>
          <Button onClick={() => setIsModalOpen(false)} text={'Close'} />
        </AccessibleDialog>
      )}
    </>
  );
};

export default ExtraLinks;
