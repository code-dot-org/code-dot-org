import {TextField, Typography} from '@mui/material';
import React, {FC} from 'react';

interface LessonReflectionProps {
  success: string;
  struggle: string;
  onSuccessChange: (value: string) => void;
  onStruggleChange: (value: string) => void;
}

const LessonReflection: FC<LessonReflectionProps> = ({
  success,
  struggle,
  onSuccessChange,
  onStruggleChange,
}) => (
  <div>
    <Typography variant="body1" component="label" htmlFor="reflection-success">
      A moment I felt successful today...
    </Typography>
    <TextField
      id="reflection-success"
      multiline
      fullWidth
      minRows={4}
      value={success}
      onChange={e => onSuccessChange(e.target.value)}
    />
    <Typography variant="body1" component="label" htmlFor="reflection-struggle">
      Something I&apos;m still confused about or working on...
    </Typography>
    <TextField
      id="reflection-struggle"
      multiline
      fullWidth
      minRows={4}
      value={struggle}
      onChange={e => onStruggleChange(e.target.value)}
    />
  </div>
);

export default LessonReflection;
