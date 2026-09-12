import Modal from '@code-dot-org/component-library/modal';
import {Button, Typography} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';

import {setSections} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {ServerSection} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import i18n from '@cdo/locale';

import styles from './instant-section.module.scss';

export default function NewInstantSection({
  onCreated,
}: {
  onCreated?: () => void;
}) {
  const dispatch = useAppDispatch();
  const pending = useRef(false);
  const [isCreating, setIsCreating] = useState(false);
  const [sectionCode, setSectionCode] = useState<string>();
  const [error, setError] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (!sectionCode && wasOpen.current) trigger.current?.focus();
    wasOpen.current = !!sectionCode;
  }, [sectionCode]);

  const createSection = async () => {
    if (pending.current) return;
    pending.current = true;
    setIsCreating(true);
    setError(false);
    try {
      const response = await HttpClient.post(
        '/api/v1/sections/instant',
        undefined,
        true
      );
      const section: ServerSection = await response.json();
      dispatch(setSections([section], false));
      setSectionCode(section.code || undefined);
      onCreated?.();
    } catch {
      setError(true);
    } finally {
      pending.current = false;
      setIsCreating(false);
    }
  };

  const closeModal = () => setSectionCode(undefined);

  return (
    <div className={styles.callToAction}>
      <Button
        ref={trigger}
        variant="outlined"
        onClick={createSection}
        disabled={isCreating}
        aria-busy={isCreating}
      >
        {isCreating ? i18n.instantSectionCreating() : i18n.instantSectionNew()}
      </Button>
      {error && <p role="alert">{i18n.instantSectionCreateError()}</p>}
      {sectionCode && (
        <Modal
          className={styles.codeModal}
          title={i18n.instantSectionTitle()}
          description={i18n.instantSectionDisplayInstructions()}
          closeLabel={i18n.closeDialog()}
          onClose={closeModal}
          primaryButtonProps={{children: i18n.done(), onClick: closeModal}}
          customContent={
            <div className={styles.codeDisplay}>
              <Typography component="p" className={styles.joinAddress}>
                code.org/join
              </Typography>
              <Typography
                component="p"
                className={styles.sectionCode}
                aria-label={sectionCode.split('').join(' ')}
              >
                {sectionCode}
              </Typography>
            </div>
          }
        />
      )}
    </div>
  );
}
