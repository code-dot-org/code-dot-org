import Dialog from '@code-dot-org/component-library/dialog';
import {Button, Typography} from '@mui/material';
import PropTypes from 'prop-types';
import QRCode from 'qrcode.react';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {v4 as uuid} from 'uuid';

import HttpClient from '@cdo/apps/util/HttpClient';

import BadgeScanner from './BadgeScanner';
import printCards from './printCards';

import styles from './badges.module.scss';

const post = async (url, data = {}) => {
  const response = await HttpClient.post(url, JSON.stringify(data), true, {
    'Content-Type': 'application/json',
  });
  return response.json();
};

export default function BadgeLoginPage({
  mode,
  strings,
  authenticityToken,
  signedIn,
  name,
  sectionId,
  sectionName,
  badge,
}) {
  const [students, setStudents] = useState([]);
  const [issuanceEnabled, setIssuanceEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(null);
  const [cards, setCards] = useState([]);
  const [scannerUrl, setScannerUrl] = useState('');
  const [ownBadge, setOwnBadge] = useState(badge);
  const printArea = useRef(null);
  const closePrint = useRef(() => {});
  const title = useRef(null);
  const base = `/sections/${sectionId}/badges`;

  const refresh = useCallback(async () => {
    const {value} = await HttpClient.fetchJson(`${base}/students`);
    setStudents(value.students);
    setIssuanceEnabled(value.issuance_enabled);
  }, [base]);
  useEffect(() => {
    title.current?.focus();
    if (mode === 'manage') {
      refresh().catch(() => setMessage(strings.network_error));
    }
  }, [mode, refresh, strings.network_error]);

  useEffect(() => () => closePrint.current(), []);

  const change = async (student, operation) => {
    const result = await post(
      mode === 'account' ? '/account/badge/revoke' : `${base}/${student.id}`,
      {
        operation,
        generation: student.badge?.generation || 0,
        request_id: uuid(),
      }
    );
    if (mode === 'account') {
      setOwnBadge(result.badge);
    }
  };

  const perform = async callback => {
    closePrint.current();
    setBusy(true);
    setMessage('');
    setCards([]);
    try {
      await callback();
      setMessage(strings.done);
    } catch {
      setMessage(strings.network_error);
    } finally {
      setPending(null);
      if (mode === 'manage') {
        await refresh().catch(() => setMessage(strings.network_error));
      }
      setBusy(false);
    }
  };

  const loadCards = studentId =>
    perform(async () => {
      const result = await post(`${base}/print`, {student_id: studentId});
      setCards(result.cards);
      setScannerUrl(result.scanner_url);
    });

  const print = () => {
    closePrint.current();
    closePrint.current = printCards(printArea.current, strings.print, () =>
      setCards([])
    );
  };

  const badgeStatus = value =>
    !value
      ? strings.none
      : value.revoked
      ? strings.revoked
      : value.expired
      ? strings.expired
      : strings.active;

  return (
    <div className={`${styles.page} rr-block`}>
      <Typography component="h1" variant="h2" ref={title} tabIndex={-1}>
        {mode === 'manage'
          ? strings.manage
          : mode === 'account'
          ? strings.account
          : mode === 'reauthenticate'
          ? strings.reauthenticate
          : strings.title}
      </Typography>
      {mode === 'scan' && !signedIn && <BadgeScanner strings={strings} />}
      {mode === 'scan' && signedIn && (
        <>
          <Typography>
            {strings.signed_in} {name}
          </Typography>
          <div className={styles.controls}>
            <Button href="/home">{strings.continue}</Button>
            <form method="post" action="/badge_login/switch">
              <input
                type="hidden"
                name="authenticity_token"
                value={authenticityToken}
              />
              <Button type="submit">{strings.switch_account}</Button>
            </form>
          </div>
        </>
      )}
      {mode === 'reauthenticate' && (
        <>
          <Typography>{strings.reauthenticate_body}</Typography>
          <form method="post" action="/badge_login/reauthenticate">
            <input
              type="hidden"
              name="authenticity_token"
              value={authenticityToken}
            />
            <Button type="submit">{strings.reauthenticate_action}</Button>
          </form>
        </>
      )}
      {mode === 'manage' && (
        <>
          <Typography component="h2" variant="h3">
            {sectionName}
          </Typography>
          <Typography>{strings.privacy}</Typography>
          <Typography>{strings.recovery}</Typography>
          <Typography>{strings.continuity}</Typography>
          <div className={styles.controls}>
            <Button
              disabled={busy || !issuanceEnabled}
              onClick={() =>
                perform(async () => {
                  for (const student of students.filter(
                    s => s.eligible && !s.badge
                  )) {
                    await change(student, 'issue');
                  }
                })
              }
            >
              {strings.issue_all}
            </Button>
            <Button disabled={busy} onClick={() => loadCards()}>
              {strings.print_all}
            </Button>
          </div>
          {students.map(student => (
            <section
              key={student.id}
              className={styles.row}
              aria-label={student.name}
            >
              <Typography component="h3" variant="h4">
                {student.name}
              </Typography>
              <Typography>
                {student.eligible
                  ? badgeStatus(student.badge)
                  : strings.unavailable}
              </Typography>
              {student.badge && (
                <Typography>
                  {strings.expires}:{' '}
                  {new Date(student.badge.expires_at).toLocaleDateString()}
                </Typography>
              )}
              {student.badge?.expires_soon && (
                <Typography>{strings.expires_soon}</Typography>
              )}
              {student.eligible && (
                <div className={styles.controls}>
                  {!student.badge && (
                    <Button
                      disabled={busy || !issuanceEnabled}
                      onClick={() => perform(() => change(student, 'issue'))}
                    >
                      {strings.issue}
                    </Button>
                  )}
                  {student.badge && (
                    <>
                      <Button
                        disabled={
                          busy || student.badge.revoked || student.badge.expired
                        }
                        onClick={() => loadCards(student.id)}
                      >
                        {strings.print}
                      </Button>
                      {['replace', 'renew', 'revoke'].map(operation => (
                        <Button
                          key={operation}
                          disabled={
                            busy || (operation !== 'revoke' && !issuanceEnabled)
                          }
                          onClick={() => setPending({student, operation})}
                        >
                          {strings[operation]}
                        </Button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </section>
          ))}
        </>
      )}
      {mode === 'account' && (
        <>
          <Typography>{badgeStatus(ownBadge)}</Typography>
          <Typography>{strings.recovery}</Typography>
          <Button
            disabled={busy || ownBadge?.revoked}
            onClick={() =>
              setPending({student: {badge: ownBadge}, operation: 'revoke'})
            }
          >
            {strings.revoke}
          </Button>
        </>
      )}
      {pending && (
        <Dialog
          title={strings[pending.operation]}
          description={strings.confirm_change}
          closeLabel={strings.back}
          onClose={() => !busy && setPending(null)}
          primaryButtonProps={{
            children: strings.confirm,
            disabled: busy,
            onClick: () =>
              perform(() => change(pending.student, pending.operation)),
          }}
          secondaryButtonProps={{
            children: strings.back,
            disabled: busy,
            onClick: () => setPending(null),
          }}
        />
      )}
      <Typography role="status" aria-live="polite">
        {busy ? strings.loading : message}
      </Typography>
      {cards.length > 0 && (
        <>
          <div className={styles.controls}>
            <Button onClick={print}>{strings.print_all}</Button>
            <Button
              onClick={() => {
                closePrint.current();
                setCards([]);
              }}
            >
              {strings.close_print}
            </Button>
          </div>
          <div ref={printArea} className={styles.cards}>
            {cards.map(card => (
              <section className={styles.card} key={card.badge_payload}>
                <h2>{card.name}</h2>
                <div
                  className={styles.qr}
                  role="img"
                  aria-label={strings.title}
                >
                  <QRCode
                    value={card.badge_payload}
                    renderAs="svg"
                    size={200}
                    level="M"
                  />
                </div>
                <p>{scannerUrl}</p>
                <p>
                  {strings.expires}:{' '}
                  {new Date(card.expires_at).toLocaleDateString()}
                </p>
                <p>{strings.privacy}</p>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

BadgeLoginPage.propTypes = {
  mode: PropTypes.oneOf(['scan', 'manage', 'account', 'reauthenticate'])
    .isRequired,
  strings: PropTypes.objectOf(PropTypes.string).isRequired,
  authenticityToken: PropTypes.string.isRequired,
  signedIn: PropTypes.bool,
  name: PropTypes.string,
  sectionId: PropTypes.number,
  sectionName: PropTypes.string,
  badge: PropTypes.object,
};
