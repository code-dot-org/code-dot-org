import {Typography} from '@mui/material';
import React from 'react';

import styles from '../sectionPreview.module.scss';

const PICTURE_ITEMS = [
  {emoji: '🚀', bg: '#E8F5E9'},
  {emoji: '🌈', bg: '#FFF3E0'},
  {emoji: '🐱', bg: '#E3F2FD'},
  {emoji: '🌟', bg: '#FCE4EC'},
  {emoji: '🎨', bg: '#F3E5F5'},
  {emoji: '🦋', bg: '#E0F7FA'},
];

const AccountTypesPreview: React.FC = () => {
  return (
    <div className={styles.accountTypesContainer}>
      <Typography variant="body1">
        Choose the right sign-in method for your students based on their age and
        needs.
      </Typography>
      <div className={styles.accountTypeCards}>
        <div className={styles.accountTypeCard}>
          <Typography variant="h6">Picture Passwords</Typography>
          <Typography variant="body2" color="textSecondary">
            Best for young students (K-2). Students click a secret image to sign
            in.
          </Typography>
          <div className={styles.accountTypeVisual}>
            <div className={styles.pictureGrid}>
              {PICTURE_ITEMS.map((item, i) => (
                <div
                  key={i}
                  className={styles.pictureItem}
                  style={{backgroundColor: item.bg}}
                >
                  {item.emoji}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.accountTypeCard}>
          <Typography variant="h6">Secret Word Passwords</Typography>
          <Typography variant="body2" color="textSecondary">
            Great for grades 2-5. Students type a memorable pair of words to
            sign in.
          </Typography>
          <div className={styles.accountTypeVisual}>
            <div className={styles.secretWordsDisplay}>
              <span className={styles.secretWord}>blue</span>
              <span className={styles.secretWord}>rocket</span>
            </div>
          </div>
        </div>

        <div className={styles.accountTypeCard}>
          <Typography variant="h6">Email & Password</Typography>
          <Typography variant="body2" color="textSecondary">
            Best for older students (6-12). Students use a personal email and
            password.
          </Typography>
          <div className={styles.accountTypeVisual}>
            <div className={styles.passwordForm}>
              <div className={styles.passwordField}>student@school.edu</div>
              <div className={styles.passwordField}>{'••••••••'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountTypesPreview;
