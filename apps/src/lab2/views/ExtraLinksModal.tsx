import React, {useEffect, useState} from 'react';

import {Heading3, StrongText} from '@cdo/apps/componentLibrary/typography';
import Button from '@cdo/apps/legacySharedComponents/Button';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {FeaturedProjectStatus} from '@cdo/generated-scripts/sharedConstants';

import {ExtraLinksLevelData, ExtraLinksProjectData} from '../types';

import moduleStyles from './extra-links.module.scss';

// Extra Links modal. This is used to display helpful links for levelbuilders, and should
// be extended to also include links for project validators as well. It replaces the haml
// version of extra links, which doesn't work on lab2 after a level change.
interface ExtraLinksModalProps {
  levelLinkData: ExtraLinksLevelData;
  projectLinkData?: ExtraLinksProjectData;
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

  const isStandaloneProject: boolean = useAppSelector(
    state => !!state.lab.levelProperties?.isProjectLevel
  );

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
      setFeaturedProjectStatus(FeaturedProjectStatus.bookmarked);
    } catch (e) {
      console.log('Error bookmarking project', e);
    }
  };

  return isOpen ? (
    <AccessibleDialog onClose={onClose}>
      <Heading3>Extra links</Heading3>
      {Object.entries(levelLinkData.links).map(([listTitle, links]) => (
        // Levels can be part of level groups (sublevels) and/or can be a template level
        // so we list these here as well.
        <div key={`${listTitle}-div`}>
          <StrongText key={`${listTitle}-title`}>{listTitle}</StrongText>
          <ul key={`${listTitle}-list`}>
            {links.map(link => (
              <li key={link.url}>
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
      <CloneLevelButton
        canClone={levelLinkData.can_clone}
        isStandaloneProject={isStandaloneProject}
        setShowCloneField={setShowCloneField}
        showCloneField={showCloneField}
        handleClone={handleClone}
        clonedLevelName={clonedLevelName}
        setClonedLevelName={setClonedLevelName}
        cloneError={cloneError}
      />
      <DeleteLevelButton
        canDelete={levelLinkData.can_delete}
        isStandaloneProject={isStandaloneProject}
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        handleDelete={handleDelete}
        deleteError={deleteError}
      />
      <ScriptLevelPathLinks
        scriptLevelPathLinks={levelLinkData.script_level_path_links}
      />
      <ProjectLinkData
        isStandaloneProject={isStandaloneProject}
        projectLinkData={projectLinkData}
        featuredProjectStatus={featuredProjectStatus}
        onBookmark={onBookmark}
      />
    </AccessibleDialog>
  ) : null;
};

interface CloneLevelButtonProps {
  canClone: boolean;
  isStandaloneProject: boolean;
  setShowCloneField: (showCloneField: boolean) => void;
  showCloneField: boolean;
  handleClone: () => void;
  clonedLevelName: string;
  setClonedLevelName: (clonedLevelName: string) => void;
  cloneError: string;
}

const CloneLevelButton: React.FunctionComponent<CloneLevelButtonProps> = ({
  canClone,
  isStandaloneProject,
  setShowCloneField,
  showCloneField,
  handleClone,
  clonedLevelName,
  setClonedLevelName,
  cloneError,
}) => {
  if (!canClone || isStandaloneProject) {
    return null;
  }
  return (
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
};

interface DeleteLevelButtonProps {
  canDelete: boolean;
  isStandaloneProject: boolean;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (showDeleteConfirm: boolean) => void;
  handleDelete: () => void;
  deleteError: string;
}
const DeleteLevelButton: React.FunctionComponent<DeleteLevelButtonProps> = ({
  canDelete,
  isStandaloneProject,
  showDeleteConfirm,
  setShowDeleteConfirm,
  handleDelete,
  deleteError,
}) => {
  if (!canDelete || isStandaloneProject) {
    return null;
  }
  return (
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
};
interface FeaturedProjectStatusProps {
  featuredProjectStatus: string | undefined;
  onBookmark: () => void;
}

const FeaturedProjectInfo: React.FunctionComponent<
  FeaturedProjectStatusProps
> = ({featuredProjectStatus, onBookmark}) => {
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

const RemixAncestry: React.FunctionComponent<{
  remixList: string[];
}> = ({remixList}) => {
  if (remixList.length === 0) {
    return <li>Not a remix.</li>;
  }
  return (
    <>
      {remixList.map((link: string) => (
        <li key={link}>
          <a href={link}>{link}</a>
        </li>
      ))}
    </>
  );
};

interface ProjectLinkDataProps {
  projectLinkData?: ExtraLinksProjectData;
  isStandaloneProject: boolean;
  featuredProjectStatus?: string;
  onBookmark: () => void;
}

const ProjectLinkData: React.FunctionComponent<ProjectLinkDataProps> = ({
  projectLinkData,
  isStandaloneProject,
  featuredProjectStatus,
  onBookmark,
}) => {
  if (!projectLinkData) {
    return null;
  }
  const ownerInfo = projectLinkData.owner_info;
  const projectInfo = projectLinkData.project_info;
  if (!ownerInfo || !projectInfo) {
    return null;
  }
  const remixList = projectInfo.remix_ancestry;

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
        {isStandaloneProject && (
          <>
            <li>
              Remix ancestry:
              <ul>
                <RemixAncestry remixList={remixList} />
              </ul>
            </li>
            <li>
              <FeaturedProjectInfo
                featuredProjectStatus={featuredProjectStatus}
                onBookmark={onBookmark}
              />
            </li>
          </>
        )}
      </ul>
    </>
  );
};

interface ScriptLevelPathLinksProps {
  scriptLevelPathLinks?: {
    script: string;
    path: string;
  }[];
}

const ScriptLevelPathLinks: React.FunctionComponent<
  ScriptLevelPathLinksProps
> = ({scriptLevelPathLinks}) => {
  if (!scriptLevelPathLinks) {
    return null;
  }
  return (
    <>
      <StrongText>
        This level is in {Object.entries(scriptLevelPathLinks).length} scripts:
      </StrongText>
      <ul>
        {scriptLevelPathLinks.map(link => (
          <li key={link.path}>
            <a href={'/s/' + link.script}>{link.script}</a> as{' '}
            <a href={link.path}>{link.path}</a>
          </li>
        ))}
      </ul>
    </>
  );
};

export default ExtraLinksModal;
