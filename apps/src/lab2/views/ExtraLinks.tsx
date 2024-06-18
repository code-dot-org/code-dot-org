import React, {useEffect, useState} from 'react';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import Button from '@cdo/apps/templates/Button';
import {useFetch} from '@cdo/apps/util/useFetch';
import HttpClient from '@cdo/apps/util/HttpClient';
import moduleStyles from './extra-links.module.scss';
import ExtraLinksModal from './ExtraLinksModal';
import {PERMISSIONS} from '../constants';

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
  const permissionData = data
    ? (data as PermissionResponse)
    : {permissions: []};
  const channelId = useAppSelector(
    state => state.lab.channel && state.lab.channel.id
  );
  console.log('channelId', channelId);

  useEffect(() => {
    const permissionData = data
      ? (data as PermissionResponse)
      : {permissions: []};
    if (
      permissionData.permissions.includes(PERMISSIONS.LEVELBUILDER) ||
      permissionData.permissions.includes(PERMISSIONS.PROJECT_VALIDATOR)
    ) {
      try {
        HttpClient.fetchJson<ExtraLinksResponse>(
          `/levels/${levelId}/extra_links`
        ).then(response => {
          console.log('response.value - levelbuilder', response.value);
          setLinkData(response.value);
        });
      } catch (e) {
        console.error('Error fetching levelbuilder extra links', e);
      }
    }
    if (permissionData.permissions.includes(PERMISSIONS.PROJECT_VALIDATOR)) {
      try {
        console.log('try p.v.');
        HttpClient.fetchJson(`/projects/${channelId}/extra_links`).then(
          response => {
            console.log('response.value - project validator', response.value);
          }
        );
      } catch (e) {
        console.error('Error fetching levelbuilder extra links', e);
      }
    }
  }, [data, levelId, channelId]);

  if (
    !permissionData.permissions.includes(PERMISSIONS.LEVELBUILDER) &&
    !permissionData.permissions.includes(PERMISSIONS.PROJECT_VALIDATOR)
  ) {
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
          permissions={permissionData.permissions}
        />
      )}
    </>
  );
};

export default ExtraLinks;
