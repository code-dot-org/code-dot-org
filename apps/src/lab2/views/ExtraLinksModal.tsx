import React, {useEffect, useState} from 'react';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {Heading3, StrongText} from '@cdo/apps/componentLibrary/typography';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import Button from '@cdo/apps/templates/Button';
import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';
import {ExtraLinksLevelData, ExtraLinksProjectData} from '../types';
import moduleStyles from './extra-links.module.scss';

// Extra Links modal. This is used to display helpful links for levelbuilders, and should
// be extended to also include links for project validators as well. It replaces the haml
// version of extra links, which doesn't work on lab2 after a level change.
interface ExtraLinksModalProps {
  levelLinkData: ExtraLinksLevelData;
  projectLinkData: ExtraLinksProjectData | null;
  isOpen: boolean;
  closeModal: () => void;
  levelId: number;
}

const ExtraLinksModal: React.FunctionComponent<ExtraLinksModalProps> = ({
  levelLinkData,
  projectLinkData,
  isOpen,
  closeModal,
  levelId,
}) => {
  const [showCloneField, setShowCloneField] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clonedLevelName, setClonedLevelName] = useState('');
  const [cloneError, setCloneError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [featuredProjectStatus, setFeaturedProjectStatus] = useState<
    string | undefined
  >('');

  const channelId: string | undefined = useAppSelector(
    state => state.lab.channel && state.lab.channel.id
  );

  const isStandaloneProject = levelLinkData.is_standalone_project;

  useEffect(() => {
    setClonedLevelName(levelLinkData.level_name);
  }, [levelLinkData]);

  useEffect(() => {
    if (projectLinkData?.project_info) {
      setFeaturedProjectStatus(projectLinkData?.project_info.featured_status);
    }
  }, [projectLinkData]);

  const onClose = () => {
    closeModal();
    setShowCloneField(false);
    setShowDeleteConfirm(false);
    setCloneError('');
    setDeleteError('');
  };

  const handleClone = async () => {
    if (clonedLevelName) {
      try {
        const response = await HttpClient.post(
          `/levels/${levelId}/clone?name=${clonedLevelName}`,
          undefined,
          true,
          {contentType: 'application/json;charset=UTF-8'}
        );
        const result = await response.json();
        if (result.redirect) {
          window.location.href = result.redirect;
        }
      } catch (e) {
        if (e instanceof NetworkError) {
          const responseText = await e.response.text();
          setCloneError(responseText);
        } else {
          setCloneError((e as Error).message);
        }
      }
    }
  };

  const handleDelete = async () => {
    try {
      const response = await HttpClient.delete(`/levels/${levelId}`, true, {
        Accept: 'application/json',
      });
      const result = await response.json();
      if (result.redirect) {
        window.location.href = result.redirect;
      }
    } catch (e) {
      if (e instanceof NetworkError) {
        const responseText = await e.response.text();
        setDeleteError(responseText);
      } else {
        setDeleteError((e as Error).message);
      }
    }
  };

  const onBookmark = async () => {
    try {
      await HttpClient.put(
        `/featured_projects/${channelId}/bookmark`,
        undefined,
        true,
        {contentType: 'application/json;charset=UTF-8'}
      );
      setFeaturedProjectStatus('bookmarked');
    } catch (e) {
      console.log('Error bookmarking project', e);
    }
  };

  const renderCloneLevel = (
    <div>
      <Button
        size={Button.ButtonSize.small}
        color={Button.ButtonColor.purple}
        onClick={() => setShowCloneField(!showCloneField)}
        text={showCloneField ? 'Cancel Clone' : 'Clone'}
      />
      {showCloneField && (
        <div>
          {'New level name: '}
          <input
            type="text"
            value={clonedLevelName}
            onChange={event => setClonedLevelName(event.target.value)}
          />
          <Button
            onClick={handleClone}
            text={'Clone'}
            size={Button.ButtonSize.small}
          />
          {cloneError && (
            <p className={moduleStyles.errorMessage}>{cloneError}</p>
          )}
        </div>
      )}
    </div>
  );

  const renderDeleteLevel = (
    <div>
      <Button
        size={Button.ButtonSize.small}
        text={showDeleteConfirm ? 'Cancel Delete' : 'Delete'}
        color={Button.ButtonColor.red}
        onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
      />
      {showDeleteConfirm && (
        <div>
          {'Are you sure you want to delete this level? '}
          <Button
            onClick={handleDelete}
            text={'Confirm Delete'}
            size={Button.ButtonSize.small}
          />
          {deleteError && (
            <p className={moduleStyles.errorMessage}>{deleteError}</p>
          )}
        </div>
      )}
    </div>
  );

  const renderScriptLevelPathLinks = (
    <>
      <StrongText>
        This level is in{' '}
        {Object.entries(levelLinkData.script_level_path_links).length} scripts:
      </StrongText>
      <ul>
        {levelLinkData.script_level_path_links.map((link, index) => (
          <li key={index}>
            <a href={'/s/' + link.script}>{link.script}</a> as{' '}
            <a href={link.path}>{link.path}</a>
          </li>
        ))}
      </ul>
    </>
  );

  const renderRemixAncestry = (remixList: string[]) => {
    if (remixList.length === 0) {
      return <li>Not a remix.</li>;
    }
    return remixList.map((link: string, index: number) => (
      <li key={index}>
        <a href={link}>{link}</a>
      </li>
    ));
  };

  const renderFeaturedProjectInfo = () => {
    if (featuredProjectStatus === 'n/a') {
      return (
        <>
          <div>Not a featured project</div>
          <Button
            size={Button.ButtonSize.small}
            color={Button.ButtonColor.purple}
            onClick={onBookmark}
            text={'Bookmark as featured'}
          />
        </>
      );
    }
    return <div>Featured project status: {featuredProjectStatus}</div>;
  };

  const renderProjectValidatorData = (
    projectValidatorLinkData: ExtraLinksProjectData
  ) => {
    const ownerInfo = projectValidatorLinkData.owner_info;
    const projectInfo = projectValidatorLinkData.project_info;

    return (
      <>
        <StrongText>Project Info</StrongText>
        <ul>
          <li>Project owner: {ownerInfo.name}</li>
          <li>Owner storage id: {ownerInfo.storage_id}</li>
          <li>Project id: {projectInfo.id}</li>
          <li>
            S3 links: <a href={`${projectInfo.sources_link}`}>Sources</a>
          </li>
          <li>
            Remix ancestry:
            <ul>{renderRemixAncestry(projectInfo.remix_ancestry)}</ul>
          </li>
          <li>{renderFeaturedProjectInfo()}</li>
        </ul>
      </>
    );
  };

  return isOpen ? (
    <AccessibleDialog onClose={onClose}>
      <Heading3>Extra links</Heading3>

      <button
        type="button"
        onClick={onClose}
        className={moduleStyles.xCloseButton}
      >
        <i id="x-close" className="fa-solid fa-xmark" />
      </button>
      {Object.entries(levelLinkData.links).map(([listTitle, links]) => (
        // Levels can be part of level groups (sublevels) and/or can be a template level
        // so we list these here as well.
        <div key={`${listTitle}-div`}>
          <StrongText key={`${listTitle}-title`}>{listTitle}</StrongText>
          <ul key={`${listTitle}-list`}>
            {links.map((link, index) => (
              <li key={index}>
                {link.url ? (
                  // This menu is only used by internal users, who have explicitly requested access keys.
                  // eslint-disable-next-line jsx-a11y/no-access-key
                  <a href={link.url} accessKey={link.access_key}>
                    {link.text}
                  </a>
                ) : (
                  <p>{link.text}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
      {levelLinkData.can_clone && !isStandaloneProject && renderCloneLevel}
      {levelLinkData.can_delete && !isStandaloneProject && renderDeleteLevel}
      {levelLinkData.script_level_path_links && renderScriptLevelPathLinks}
      {projectLinkData &&
        isStandaloneProject &&
        renderProjectValidatorData(projectLinkData)}
    </AccessibleDialog>
  ) : null;
};

export default ExtraLinksModal;
