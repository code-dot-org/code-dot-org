import TextField from '@code-dot-org/component-library/textField';
import {Button, Typography} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';

import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

import styles from './instant-section.module.scss';

const SECTION_CODE_LENGTH = 6;
const MAX_NAME_LENGTH = 70;

export default function JoinInstantSection() {
  const returnTo = new URLSearchParams(window.location.search).get('return_to');
  const initialCode = returnTo?.match(/^\/join\/([a-z]{6})$/i)?.[1] || '';
  const [code, setCode] = useState(initialCode.toUpperCase());
  const [confirmedCode, setConfirmedCode] = useState<string>();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  const nameInput = useRef<HTMLInputElement>(null);
  const codeInput = useRef<HTMLInputElement>(null);
  const previousCode = useRef<string>();

  useEffect(() => {
    if (isSubmitting) return;
    if (confirmedCode) {
      nameInput.current?.focus();
    } else if (previousCode.current) {
      codeInput.current?.focus();
    }
    previousCode.current = confirmedCode;
  }, [confirmedCode, isSubmitting]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true;
    setIsSubmitting(true);
    setError('');
    try {
      if (confirmedCode) {
        const response = await HttpClient.post(
          `/instant_sections/${confirmedCode}/join`,
          JSON.stringify({name: name.trim()}),
          true,
          {'Content-Type': 'application/json'}
        );
        const {redirect_url: redirectUrl} = await response.json();
        window.location.assign(redirectUrl);
      } else {
        const {value} = await HttpClient.fetchJson<{code: string}>(
          `/instant_sections/${encodeURIComponent(code.trim())}`
        );
        setConfirmedCode(value.code);
      }
    } catch (err) {
      if (err instanceof NetworkError && err.response.status === 404) {
        setConfirmedCode(undefined);
        setError(i18n.instantSectionUnavailable());
      } else if (err instanceof NetworkError && err.response.status === 422) {
        setError(i18n.instantSectionNameError());
      } else {
        setError(i18n.instantSectionJoinError());
      }
    } finally {
      pending.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className={styles.joinPanel}
      aria-labelledby="instant-section-title"
    >
      <Typography component="h1" variant="h3" id="instant-section-title">
        {i18n.instantSectionJoinTitle()}
      </Typography>
      <Typography>{i18n.instantSectionJoinInstructions()}</Typography>
      <form
        onSubmit={submit}
        className={styles.joinForm}
        aria-busy={isSubmitting}
      >
        {confirmedCode ? (
          <>
            <Typography>
              {i18n.instantSectionJoining({code: confirmedCode})}
            </Typography>
            <TextField
              ref={nameInput}
              name="name"
              label={i18n.instantSectionName()}
              aria-label={i18n.instantSectionName()}
              value={name}
              onChange={event => setName(event.target.value)}
              maxLength={MAX_NAME_LENGTH}
              autoComplete="given-name"
              required
              disabled={isSubmitting}
              errorMessage={error || undefined}
            />
          </>
        ) : (
          <TextField
            ref={codeInput}
            name="section_code"
            label={i18n.sectionCode()}
            aria-label={i18n.sectionCode()}
            value={code}
            onChange={event => setCode(event.target.value.toUpperCase())}
            maxLength={SECTION_CODE_LENGTH}
            minLength={SECTION_CODE_LENGTH}
            pattern="[A-Za-z]{6}"
            autoComplete="off"
            spellCheck={false}
            required
            disabled={isSubmitting}
            errorMessage={error || undefined}
          />
        )}
        <div role="alert" className={styles.errorAnnouncement}>
          {error}
        </div>
        <Button
          variant="contained"
          type="submit"
          disabled={
            isSubmitting ||
            (confirmedCode ? !name.trim() : code.length !== SECTION_CODE_LENGTH)
          }
        >
          {confirmedCode ? i18n.joinSection() : i18n.continue()}
        </Button>
        {confirmedCode && (
          <Button
            variant="text"
            disabled={isSubmitting}
            onClick={() => {
              setConfirmedCode(undefined);
              setError('');
            }}
          >
            {i18n.instantSectionChangeCode()}
          </Button>
        )}
      </form>
    </section>
  );
}
