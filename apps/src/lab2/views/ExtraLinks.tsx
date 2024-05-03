import {Heading3, StrongText} from '@cdo/apps/componentLibrary/typography';
import AccessibleDialog from '@cdo/apps/templates/AccessibleDialog';
import Button from '@cdo/apps/templates/Button';
import {useFetch} from '@cdo/apps/util/useFetch';
import React, {useEffect, useState} from 'react';
import moduleStyles from './extra-links.module.scss';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

interface ExtraLinksProps {
  levelId: number;
}

interface ExtraLinksResponse {
  links: {[key: string]: {text: string; url: string}[]};
  can_clone: boolean;
  can_delete: boolean;
  level_name: string;
}

const ExtraLinks: React.FunctionComponent<ExtraLinksProps> = ({
  levelId,
}: ExtraLinksProps) => {
  const {loading, data, status} = useFetch(`/levels/${levelId}/extra_links`);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCloneField, setShowCloneField] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clonedLevelName, setClonedLevelName] = useState('');
  const [cloneError, setCloneError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  console.log({loading, data, status});
  const linkData = data as ExtraLinksResponse;
  useEffect(() => {
    if (linkData) {
      setClonedLevelName(linkData.level_name);
    }
  }, [linkData]);
  if (loading || status !== 200) {
    return <></>;
  }

  const onClose = () => setIsModalOpen(false);
  const handleClone = async () => {
    console.log('cloning', clonedLevelName);
    if (clonedLevelName) {
      $.ajax({
        url: `/levels/${levelId}/clone?name=${clonedLevelName}`,
        method: 'POST',
        dataType: 'json',
        contentType: 'application/json;charset=UTF-8',
        headers: {
          'X-CSRF-Token': await getAuthenticityToken(),
        },
      })
        .done(result => {
          // Redirect to the new level
          if (result.redirect) {
            window.location.href = result.redirect;
          }
        })
        .fail(error => {
          setCloneError(error.responseText);
        });
    }
  };

  const handleDelete = async () => {
    $.ajax({
      url: `/levels/${levelId}`,
      method: 'DELETE',
      dataType: 'json',
    })
      .done(result => {
        if (result.redirect) {
          window.location.href = result.redirect;
        }
      })
      .fail(error => {
        setDeleteError(error.responseText);
      });
  };

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        text={'Extra Links'}
        className={moduleStyles.extraLinksButton}
      />
      {isModalOpen && (
        <AccessibleDialog onClose={onClose}>
          <Heading3>Extra links</Heading3>

          <button
            type="button"
            onClick={onClose}
            className={moduleStyles.xCloseButton}
          >
            <i id="x-close" className="fa-solid fa-xmark" />
          </button>
          {Object.entries(linkData.links).map(([listTitle, links]) => (
            <div key={`${listTitle}-div`}>
              <StrongText key={`${listTitle}-title`}>{listTitle}</StrongText>
              <ul key={`${listTitle}-list`}>
                {links.map((link, index) => (
                  <li key={index}>
                    {link.url ? (
                      <a href={link.url}>{link.text}</a>
                    ) : (
                      <p>{link.text}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {linkData.can_clone && (
            <div>
              <Button
                size={Button.ButtonSize.small}
                color={Button.ButtonColor.purple}
                onClick={() => setShowCloneField(!showCloneField)}
                text={showCloneField ? 'Cancel Clone' : 'Clone'}
              />
              {showCloneField && (
                <div>
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
          )}
          {linkData.can_delete && (
            <div>
              <Button
                size={Button.ButtonSize.small}
                text={showDeleteConfirm ? 'Cancel Delete' : 'Delete'}
                color={Button.ButtonColor.red}
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              />
              {showDeleteConfirm && (
                <div>
                  Are you sure you want to delete this level?
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
          )}
        </AccessibleDialog>
      )}
    </>
  );
};

export default ExtraLinks;
