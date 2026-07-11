import {Button, Typography} from '@mui/material';
import {useState, type FormEvent} from 'react';

import TextField from '@code-dot-org/component-library/textField';

import styles from './personalizeForm.module.css';

/**
 * Name entry matching legacy Certificate.jsx: heading, single-line input,
 * Submit; replaced by a thank-you message once personalized.
 */
export function PersonalizeForm({
  onSubmit,
  personalized,
}: {
  onSubmit: (name: string) => void;
  personalized: boolean;
}) {
  const [name, setName] = useState('');

  if (personalized) {
    return (
      <div>
        <Typography gutterBottom variant="h2">
          Thanks for submitting!
        </Typography>
        <Typography gutterBottom variant="body2">
          Now, see options below to keep going with our other courses.
        </Typography>
      </div>
    );
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Typography gutterBottom variant="h3">
        Personalize your certificate
      </Typography>
      <div className={styles.inputRow}>
        <TextField
          label="Enter Your Name"
          name="name"
          onChange={event => setName(event.target.value)}
          placeholder="Your name"
          value={name}
        />
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </div>
    </form>
  );
}
