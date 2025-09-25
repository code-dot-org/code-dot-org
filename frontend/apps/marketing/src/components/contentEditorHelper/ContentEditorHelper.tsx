'use client';

import {useSearchParams} from 'next/navigation';
import {useState} from 'react';

import Button from '@code-dot-org/component-library/button';
import Popover from '@code-dot-org/component-library/popover';

import ContentEditorTools from '@/components/contentEditorHelper/Tools';

import styles from './styles.module.scss';

export type ContentEditorToolsProps = {
  isDraftModeEnabled: boolean;
};

const ContentEditorHelper = ({isDraftModeEnabled}: ContentEditorToolsProps) => {
  const searchParams = useSearchParams();
  const [popoverVisible, setPopoverVisible] = useState(false);
  const previewLabel = isDraftModeEnabled
    ? 'Draft Version'
    : 'Published Version';

  const handleButtonClick = () => {
    setPopoverVisible(true);
  };

  const handlePopoverClose = () => {
    setPopoverVisible(false);
  };

  const getRender = () => {
    return (
      <ContentEditorTools
        isDraftModeEnabled={isDraftModeEnabled}
        previewLabel={previewLabel}
      />
    );
  };

  return (
    <>
      {popoverVisible && (
        <Popover
          className={styles.contentEditorPopover}
          direction={'none'}
          title={'Content Editor Tools'}
          content={''}
          onClose={handlePopoverClose}
        >
          <div className={styles.contentFlexContainer}>{getRender()}</div>
        </Popover>
      )}

      {!popoverVisible &&
        (searchParams.get('contentEditor') === 'true' ||
          isDraftModeEnabled) && (
          <Button
            data-testid="content-editor-popover"
            className={styles.floatingButton}
            color={'destructive'}
            text={previewLabel}
            size={'m'}
            onClick={handleButtonClick}
          />
        )}
    </>
  );
};

export default ContentEditorHelper;
