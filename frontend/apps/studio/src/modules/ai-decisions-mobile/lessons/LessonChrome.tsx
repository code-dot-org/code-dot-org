/**
 * LessonChrome — top app bar for in-lesson screens.
 *
 * Layout (FR-002f):
 *   [← back]   [Lesson name]   [LanguageToggle]
 *
 * No seat indicator inside lessons (per spec).
 * The back chevron navigates to /m/journey via onBack.
 */

import {AppBar, Box, IconButton, Toolbar, Typography} from '@mui/material';

import {LanguageToggle} from '../i18n/LanguageToggle';
import type {Language} from '../seats/types';

export interface LessonChromeProps {
  /** Lesson name displayed in the center. */
  lessonName: string;
  /** Currently active language. */
  lang: Language;
  /** Called when the learner taps the back chevron. */
  onBack: () => void;
  /** Called when the learner taps a language segment. */
  onToggleLanguage: (lang: Language) => void;
}

/**
 * Top chrome bar for in-lesson screens.
 * Intentionally omits the seat indicator (FR-002f).
 */
export function LessonChrome({
  lessonName,
  lang,
  onBack,
  onToggleLanguage,
}: LessonChromeProps) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{backgroundColor: 'primary.main'}}
    >
      <Toolbar sx={{minHeight: 56, gap: 1}}>
        <IconButton
          aria-label="Back to journey"
          onClick={onBack}
          size="small"
          sx={{
            color: 'primary.contrastText',
            flexShrink: 0,
            // Minimum 44dp tap target
            minWidth: 44,
            minHeight: 44,
          }}
        >
          {/* Unicode chevron left — avoids @mui/icons-material dependency */}
          <Box component="span" sx={{fontSize: '1rem', lineHeight: 1}}>
            ‹
          </Box>
        </IconButton>

        <Typography
          variant="subtitle1"
          component="h1"
          sx={{
            flex: 1,
            textAlign: 'center',
            color: 'primary.contrastText',
            fontWeight: 700,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {lessonName}
        </Typography>

        <LanguageToggle lang={lang} onToggle={onToggleLanguage} />
      </Toolbar>
    </AppBar>
  );
}
