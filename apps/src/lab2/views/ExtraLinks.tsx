import React, {useEffect, useState} from 'react';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import Button from '@cdo/apps/templates/Button';
import {useFetch} from '@cdo/apps/util/useFetch';
import HttpClient from '@cdo/apps/util/HttpClient';
import {ExtraLinksLevelbuilderData} from '@cdo/apps/lab2/types';
import moduleStyles from './extra-links.module.scss';
import ExtraLinksModal from './ExtraLinksModal';
import {PERMISSIONS} from '../constants';

interface ExtraLinksProps {
  levelId: number;
}

interface PermissionResponse {
  permissions: string[];
}

// If the user has permission to see extra links, fetch extra links for the level,
// then display a modal with the link data.
const ExtraLinks: React.FunctionComponent<ExtraLinksProps> = ({
  levelId,
}: ExtraLinksProps) => {
  const {loading, data} = useFetch('/api/v1/users/current/permissions');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [levelbuilderLinkData, setLevelbuilderLinkData] =
    useState<ExtraLinksLevelbuilderData | null>(null);
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
        HttpClient.fetchJson<ExtraLinksLevelbuilderData>(
          `/levels/${levelId}/extra_links`
        ).then(response => {
          console.log('response.value - levelbuilder', response.value);
          setLevelbuilderLinkData(response.value);
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

  return loading || !levelbuilderLinkData ? null : (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        text={'Extra Links'}
        className={moduleStyles.extraLinksButton}
      />
      {levelbuilderLinkData && (
        <ExtraLinksModal
          levelbuilderLinkData={levelbuilderLinkData}
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
