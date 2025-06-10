'use client';

import {useSearchParams} from 'next/navigation';
import {useEffect, useState} from 'react';

import Button from '@code-dot-org/component-library/button';
import Popover from '@code-dot-org/component-library/popover';
import {BodyTwoText} from '@code-dot-org/component-library/typography';

import ContentEditorTools from '@/components/contentEditorHelper/Tools';

import TokenPrompt from './TokenPrompt';

import styles from './styles.module.scss';

export type ContentEditorToolsProps = {
  isDraftModeEnabled: boolean;
};

const ContentEditorHelper = ({isDraftModeEnabled}: ContentEditorToolsProps) => {
  const searchParams = useSearchParams();
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [renderState, setRenderState] = useState<
    'loading' | 'token-prompt' | 'tools'
  >('loading');

  useEffect(() => {
    setRenderState(
      localStorage.getItem('draftToken') ? 'tools' : 'token-prompt',
    );
  }, []);

  const previewLabel = isDraftModeEnabled
    ? 'Draft Version'
    : 'Published Version';

  const handleButtonClick = () => {
    setPopoverVisible(true);
  };

  const handlePopoverClose = () => {
    setPopoverVisible(false);
  };

  const handleSubmitToken = (token: string | null) => {
    if (token) {
      localStorage.setItem('draftToken', token);
      setRenderState('tools');
    }
  };

  const getRender = () => {
    switch (renderState) {
      case 'loading':
        return <BodyTwoText>Loading...</BodyTwoText>;
      case 'token-prompt':
        return <TokenPrompt onSubmit={handleSubmitToken} />;
      case 'tools':
        return (
          <ContentEditorTools
            isDraftModeEnabled={isDraftModeEnabled}
            onChangeDraftToken={() => setRenderState('token-prompt')}
            previewLabel={previewLabel}
          />
        );
    }
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
