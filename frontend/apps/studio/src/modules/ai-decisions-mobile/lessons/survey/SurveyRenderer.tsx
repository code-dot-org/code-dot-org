/**
 * SurveyRenderer — multi-page level group (kind: 'survey').
 *
 * Each page is one of two shapes:
 *   - {kind:'multi', questionKey, options[]} — multi-choice question
 *   - {kind:'text',  bodyKey}                — markdown text page; tap Next to advance
 *
 * Source of truth: dashboard `.level_group` files.  text pages come
 * from `text 'name'` entries (load the named .level's long_instructions
 * as the markdown body); free-response level pages are rendered as
 * text pages with no input (mobile v1 — just acknowledge the prompt).
 */

import {Box, Button, Typography} from '@mui/material';
import {useState, useCallback} from 'react';

import type {Level} from '../../content/types';
import {useString} from '../../i18n/StringsProvider';
import {SpeakerAffordance} from '../../tts/SpeakerAffordance';
import {Markdown} from '../Markdown';

type SurveyPage =
  | {
      kind: 'multi';
      questionKey: string;
      options: Array<{key: string; correct: boolean}>;
    }
  | {kind: 'text'; bodyKey: string};

interface SurveyPayload {
  pages: SurveyPage[];
}

export interface SurveyRendererProps {
  level: Level;
  onComplete: (perfect: boolean) => void;
}

/** Multi-page survey renderer for `kind: 'survey'` levels. */
export function SurveyRenderer({level, onComplete}: SurveyRendererProps) {
  const getString = useString;
  const payload = level.payload as SurveyPayload;
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedOnPage, setSelectedOnPage] = useState<string | null>(null);

  const page = payload.pages[pageIndex];
  const isLast = pageIndex === payload.pages.length - 1;

  const handleSelect = useCallback((key: string) => setSelectedOnPage(key), []);

  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete(true);
      return;
    }
    setPageIndex(i => i + 1);
    setSelectedOnPage(null);
  }, [isLast, onComplete]);

  if (!page) {
    return (
      <Box sx={{padding: 2}}>
        <Typography>No survey pages.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, padding: 2}}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{fontSize: '0.75rem'}}
      >
        Page {pageIndex + 1} of {payload.pages.length}
      </Typography>

      {page.kind === 'text' ? (
        <Markdown text={getString(page.bodyKey)} />
      ) : (
        <>
          {(() => {
            const questionText = getString(page.questionKey);
            return (
              <>
                <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1}}>
                  <Box sx={{flex: 1}}>
                    <Markdown text={questionText} />
                  </Box>
                  <SpeakerAffordance
                    text={questionText}
                    ariaLabel="Read question aloud"
                  />
                </Box>
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                  {page.options.map(opt => (
                    <Button
                      key={opt.key}
                      variant={
                        selectedOnPage === opt.key ? 'contained' : 'outlined'
                      }
                      onClick={() => handleSelect(opt.key)}
                      sx={{justifyContent: 'flex-start', textAlign: 'left'}}
                    >
                      <Markdown text={getString(opt.key)} sx={{gap: 0}} />
                    </Button>
                  ))}
                </Box>
              </>
            );
          })()}
        </>
      )}

      <Button
        variant="contained"
        onClick={handleNext}
        disabled={page.kind === 'multi' && selectedOnPage === null}
        sx={{marginTop: 1}}
      >
        {isLast ? 'Finish' : 'Next'}
      </Button>
    </Box>
  );
}
