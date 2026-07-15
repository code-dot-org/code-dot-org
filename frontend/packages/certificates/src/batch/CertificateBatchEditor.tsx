import {Button, TextField, Typography} from '@mui/material';
import {useState, type FormEvent} from 'react';

import styles from './certificateBatchPage.module.css';
import {normalizeStudentNames} from './normalizeStudentNames';

export function CertificateBatchEditor({
  blankPrintHref,
  courseTitle,
  onSubmit,
}: {
  blankPrintHref: string;
  courseTitle: string;
  onSubmit: (names: readonly string[]) => void;
}) {
  const [studentNames, setStudentNames] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const names = normalizeStudentNames(studentNames);
    if (names.length > 0) {
      onSubmit(names);
    }
  };

  return (
    <div className={styles.editor}>
      <Typography gutterBottom variant="h3">
        Create Your Certificates
      </Typography>
      <Typography gutterBottom variant="body2">
        Enter up to 30 names, <strong>one per line</strong>. A printable page
        with personalized {courseTitle} certificates will be generated.
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Student names"
          minRows={8}
          multiline
          name="studentNames"
          onChange={event => setStudentNames(event.target.value)}
          placeholder="John Smith"
          value={studentNames}
        />
        <div>
          <Button type="submit" variant="contained">
            Generate Certificates
          </Button>
        </div>
        <hr />
        <Typography variant="body2">
          Want a blank certificate template to write in your students' names?{' '}
          <a href={blankPrintHref}>Print one here.</a>
        </Typography>
      </form>
    </div>
  );
}
