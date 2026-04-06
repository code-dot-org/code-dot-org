import {TextField, Typography} from '@mui/material';
import React, {FC, useState} from 'react';

const LessonReflection: FC = () => {
  const [success, setSuccess] = useState('');
  const [confused, setConfused] = useState('');

  return (
    <div>
      <Typography
        variant="body1"
        component="label"
        htmlFor="reflection-success"
      >
        A moment I felt successful today...
      </Typography>
      <TextField
        id="reflection-success"
        multiline
        fullWidth
        minRows={4}
        value={success}
        onChange={e => setSuccess(e.target.value)}
      />
      <Typography
        variant="body1"
        component="label"
        htmlFor="reflection-confused"
      >
        Something I&apos;m still confused about or working on...
      </Typography>
      <TextField
        id="reflection-confused"
        multiline
        fullWidth
        minRows={4}
        value={confused}
        onChange={e => setConfused(e.target.value)}
      />
    </div>
  );
};

export default LessonReflection;
