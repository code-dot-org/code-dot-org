import {Button as MuiButton, Typography} from '@mui/material';
import React, {useCallback} from 'react';

import {fetchThreadMessages} from '@cdo/apps/aiDifferentiation/redux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {Context} from './types';

import styles from './home-screen.module.scss';

interface HomeScreenProps {
  context: Context;
  curriculumCourses: string[];
  onStartChat: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  context,
  curriculumCourses,
  onStartChat,
}) => {
  const dispatch = useAppDispatch();

  const handleStartChat = useCallback(() => {
    dispatch(
      fetchThreadMessages({
        contextType: context.type,
        thread: 0,
        curriculumCourses,
      })
    );
    onStartChat();
  }, [dispatch, context, curriculumCourses, onStartChat]);

  return (
    <div className={styles.container}>
      <Typography variant="h6" className={styles.header}>
        How can your TA support you today?
      </Typography>
      <MuiButton
        variant="contained"
        color="primary"
        onClick={handleStartChat}
        type="button"
      >
        Start a chat
      </MuiButton>
    </div>
  );
};

export default HomeScreen;
