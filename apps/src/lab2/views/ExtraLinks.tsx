import Button from '@cdo/apps/templates/Button';
import {useFetch} from '@cdo/apps/util/useFetch';
import React, {useEffect, useState} from 'react';
import moduleStyles from './extra-links.module.scss';
import ExtraLinksModal from './ExtraLinksModal';

interface ExtraLinksProps {
  levelId: number;
}

interface PermissionResponse {
  permissions: string[];
}

interface ExtraLinksResponse {
  links: {[key: string]: {text: string; url: string; access_key?: string}[]};
  can_clone: boolean;
  can_delete: boolean;
  level_name: string;
}

// Fetch extra links for the level, then display a modal with the link data.
const ExtraLinks: React.FunctionComponent<ExtraLinksProps> = ({
  levelId,
}: ExtraLinksProps) => {
  const {loading, data} = useFetch('/api/v1/users/current/permissions');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [linkData, setLinkData] = useState<ExtraLinksResponse | null>(null);

  useEffect(() => {
    const permissionData = data
      ? (data as PermissionResponse)
      : {permissions: []};
    if (permissionData.permissions.includes('levelbuilder')) {
      fetch(`/levels/${levelId}/extra_links`).then(response => {
        if (response.ok) {
          response.json().then((data: ExtraLinksResponse) => {
            setLinkData(data);
          });
        }
      });
    }
  }, [data, levelId]);

  const permissionData = data
    ? (data as PermissionResponse)
    : {permissions: []};

  if (!permissionData.permissions.includes('levelbuilder')) {
    return <></>;
  }

  return loading || !linkData ? null : (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        text={'Extra Links'}
        className={moduleStyles.extraLinksButton}
      />
      {linkData && (
        <ExtraLinksModal
          linkData={linkData}
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          levelId={levelId}
        />
      )}
    </>
  );
};

export default ExtraLinks;
