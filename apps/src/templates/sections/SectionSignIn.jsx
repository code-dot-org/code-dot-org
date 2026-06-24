import Checkbox from '@code-dot-org/component-library/checkbox';
import Chips from '@code-dot-org/component-library/chips';
import TextField from '@code-dot-org/component-library/textField';
import {Typography as MuiTypography, Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import clientState from '@cdo/apps/code-studio/clientState';

import styles from './section-sign-in.module.scss';

/**
 * Design-system version of the student "sign in to a section" page
 * (sections#show). Students pick their name, then a secret picture or word, and
 * submit. Built from DSCO components; the form is still a native POST (with the
 * Rails CSRF token) so the server-side authentication flow is unchanged. The
 * translated copy, student/picture data, CSRF token, and submit path are
 * supplied by the server.
 */
export default function SectionSignIn({
  submitPath,
  authenticityToken,
  welcome,
  nameInstruction,
  pictureInstruction,
  wordInstruction,
  pairProgramming,
  loginLabel,
  signingInLabel,
  students,
  secretPictures,
  loginType,
  loginTypePicture,
  loginTypeWord,
  pairingAllowed,
}) {
  const [userId, setUserId] = useState(null);
  const [pictureId, setPictureId] = useState(null);
  const [secretWords, setSecretWords] = useState('');
  const [pairing, setPairing] = useState(false);
  // Mirrors the legacy submit button's `disable_with`: disable on submit and
  // swap the label so the form can't be double-submitted.
  const [submitting, setSubmitting] = useState(false);

  const isPicture = loginType === loginTypePicture;
  const isWord = loginType === loginTypeWord;

  const nameChosen = userId !== null;
  let secretChosen = false;
  if (isPicture) {
    secretChosen = pictureId !== null;
  } else if (isWord) {
    secretChosen = secretWords.trim().length > 0;
  }
  const showPairing = pairingAllowed && secretChosen;

  // The DSCO Chips group is multi-select; drive it as single-select by keeping
  // at most one value. `setValues` receives the next array (the clicked chip
  // added, or removed when the current one is clicked again). Picking a
  // (different) name resets the secret-picture/word selection, per the legacy
  // flow.
  const onSelectName = nextValues => {
    const added = nextValues.find(value => value !== String(userId));
    setUserId(added ? Number(added) : null);
    setPictureId(null);
    setSecretWords('');
    setPairing(false);
  };

  return (
    <div className={styles.container}>
      <MuiTypography variant="h2" gutterBottom>
        {welcome}
      </MuiTypography>

      <form
        action={submitPath}
        method="post"
        className={styles.form}
        onSubmit={() => {
          setSubmitting(true);
          clientState.reset();
        }}
      >
        <input
          type="hidden"
          name="authenticity_token"
          value={authenticityToken}
        />
        <input type="hidden" name="user_id" value={userId || ''} />
        <input type="hidden" name="secret_picture_id" value={pictureId || ''} />

        <MuiTypography variant="h4" component="h2">
          {nameInstruction}
        </MuiTypography>
        <Chips
          name="student_name_chip"
          options={students.map(student => ({
            value: String(student.id),
            label: student.name,
          }))}
          values={userId !== null ? [String(userId)] : []}
          setValues={onSelectName}
        />

        {nameChosen && isPicture && (
          <div className={styles.secret}>
            <MuiTypography variant="h4" component="h2">
              {pictureInstruction}
            </MuiTypography>
            <ul className={styles.tiles}>
              {secretPictures.map(picture => (
                <li key={picture.id}>
                  <button
                    type="button"
                    aria-pressed={pictureId === picture.id}
                    className={classNames(styles.tile, {
                      [styles.tileSelected]: pictureId === picture.id,
                    })}
                    onClick={() => setPictureId(picture.id)}
                  >
                    <img src={picture.path} width={66} alt={picture.name} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {nameChosen && isWord && (
          <div className={styles.secret}>
            <MuiTypography variant="h4" component="h2">
              {wordInstruction}
            </MuiTypography>
            <TextField
              name="secret_words"
              value={secretWords}
              onChange={e => setSecretWords(e.target.value)}
              autoComplete="off"
              className={styles.wordInput}
            />
          </div>
        )}

        {showPairing && (
          <Checkbox
            name="show_pairing_dialog"
            value="1"
            checked={pairing}
            onChange={e => setPairing(e.target.checked)}
            label={pairProgramming}
          />
        )}

        {nameChosen && (
          <MuiButton
            type="submit"
            variant="contained"
            color="primary"
            disabled={!secretChosen || submitting}
          >
            {submitting ? signingInLabel : loginLabel}
          </MuiButton>
        )}
      </form>
    </div>
  );
}

SectionSignIn.propTypes = {
  submitPath: PropTypes.string.isRequired,
  authenticityToken: PropTypes.string.isRequired,
  welcome: PropTypes.string.isRequired,
  nameInstruction: PropTypes.string.isRequired,
  pictureInstruction: PropTypes.string,
  wordInstruction: PropTypes.string,
  pairProgramming: PropTypes.string.isRequired,
  loginLabel: PropTypes.string.isRequired,
  signingInLabel: PropTypes.string.isRequired,
  students: PropTypes.arrayOf(
    PropTypes.shape({id: PropTypes.number, name: PropTypes.string})
  ).isRequired,
  secretPictures: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      path: PropTypes.string,
      name: PropTypes.string,
    })
  ),
  loginType: PropTypes.string.isRequired,
  loginTypePicture: PropTypes.string.isRequired,
  loginTypeWord: PropTypes.string.isRequired,
  pairingAllowed: PropTypes.bool,
};
