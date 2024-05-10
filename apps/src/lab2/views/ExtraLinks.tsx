import Button from '@cdo/apps/templates/Button';
import {useFetch} from '@cdo/apps/util/useFetch';
import React, {useEffect, useState} from 'react';
import moduleStyles from './extra-links.module.scss';
import ExtraLinksModal from './ExtraLinksModal';
import {PERMISSIONS} from '../constants';
import HttpClient from '@cdo/apps/util/HttpClient';

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
  script_level_path_links: {
    script: string;
    path: string;
  }[];
}

// If the user has permission to see extra links, fetch extra links for the level,
// then display a modal with the link data.
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
    if (permissionData.permissions.includes(PERMISSIONS.LEVELBUILDER)) {
      try {
        HttpClient.fetchJson<ExtraLinksResponse>(
          `/levels/${levelId}/extra_links`
        ).then(response => {
          setLinkData(response.value);
        });
      } catch (e) {
        console.error('Error fetching extra links', e);
      }
    }
  }, [data, levelId]);

  const permissionData = data
    ? (data as PermissionResponse)
    : {permissions: []};

  if (!permissionData.permissions.includes(PERMISSIONS.LEVELBUILDER)) {
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
          closeModal={() => setIsModalOpen(false)}
          levelId={levelId}
        />
      )}
    </>
  );
};

export default ExtraLinks;
