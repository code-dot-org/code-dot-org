/**
 * BubbleChoiceRenderer — capstone bubble-choice level renderer.
 *
 * Presents the learner with 2–4 large circular choice bubbles from
 * `payload.options`.  All choices are reflective (no wrong answer);
 * tapping any bubble fires onComplete(perfect=true).
 */

import {Box, Typography} from '@mui/material';

import type {Level} from '../../content/types';
import {useLanguage, useString} from '../../i18n/StringsProvider';

/** One choice in the capstone bubble.  `sourceKey` points at the prod
 * sub-level id; `key` is the strings.json entry holding the title. */
interface BubbleOption {
  key: string;
  sourceKey: string;
}

interface BubbleChoicePayload {
  options: BubbleOption[];
  /** Optional raw markdown description, shown above the bubbles. */
  descriptionRaw?: string;
}

export interface BubbleChoiceRendererProps {
  level: Level;
  onComplete: (perfect: boolean) => void;
}

/** Capstone bubble-choice renderer for `kind: 'bubble-choice'` levels. */
export function BubbleChoiceRenderer({
  level,
  onComplete,
}: BubbleChoiceRendererProps) {
  // useLanguage triggers a re-render on language switch, even though we
  // resolve titles via useString below.
  useLanguage();
  const getString = useString;
  const payload = level.payload as BubbleChoicePayload;
  const promptText = level.title.en;
  const description = payload.descriptionRaw?.replace(/^#+\s*/, '');

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3, padding: 2}}>
      <Typography variant="h5" textAlign="center" sx={{fontWeight: 700}}>
        {promptText}
      </Typography>
      {description && (
        <Typography variant="body1" textAlign="center" color="text.secondary">
          {description}
        </Typography>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 2,
        }}
      >
        {(payload.options ?? []).map(option => {
          const label = getString(option.key);
          return (
            <Box
              key={option.key}
              component="button"
              onClick={() => onComplete(true)}
              sx={{
                aspectRatio: '1',
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 1.5,
                fontSize: '0.9rem',
                fontWeight: 700,
                textAlign: 'center',
                lineHeight: 1.2,
                minWidth: 96,
                minHeight: 96,
                overflow: 'hidden',
                wordBreak: 'break-word',
                // Prevent long titles like "Create a Sprite Lab project"
                // from blasting out of the circle.
                hyphens: 'auto',
                '&:hover': {backgroundColor: 'primary.dark'},
                '&:active': {transform: 'scale(0.96)'},
              }}
            >
              {label}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
