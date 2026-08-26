import {Menu, MenuItem, Popover, Typography} from '@mui/material';
import {useEffect, useRef, useState} from 'react';

import {useEscapeKeyHandler} from '@code-dot-org/component-library/common/hooks';
import Tags from '@code-dot-org/component-library/tags';

import {authoringApi, draftExperienceId} from '../api';

import ContentComposer from './ContentComposer';

import styles from './authoring.module.scss';

type Mode = 'menu' | 'content' | 'level' | null;

interface InsertPointProps {
  lessonId: string;
  position: number;
  /** Author chose "Ask AI here": focus the AI sidebar on this spot. */
  onAskAiAt: (position: number) => void;
}

/**
 * The "+ add here" insertion point. Offers three ways to fill the slot: hand
 * it to the AI (today's only path), write content directly, or attach an
 * existing Levelbuilder level — all three append to the same CurriculumChange
 * log, so the AI and a direct author edit are indistinguishable afterward.
 */
export default function InsertPoint({
  lessonId,
  position,
  onAskAiAt,
}: InsertPointProps) {
  const [mode, setMode] = useState<Mode>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setMode(null);
    // Standard menu/popover a11y: return focus to the control that opened it.
    buttonRef.current?.focus();
  };

  return (
    <div className={styles.railInsert}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Add an activity at position ${position + 1}`}
        aria-haspopup="menu"
        aria-expanded={mode === 'menu'}
        onClick={e => {
          setAnchorEl(e.currentTarget);
          setMode('menu');
        }}
      >
        <Typography variant="body4" component="span">
          + add here
        </Typography>
      </button>

      <Menu anchorEl={anchorEl} open={mode === 'menu'} onClose={close}>
        <MenuItem
          onClick={() => {
            onAskAiAt(position);
            close();
          }}
        >
          Ask AI here
        </MenuItem>
        <MenuItem onClick={() => setMode('content')}>Write content</MenuItem>
        <MenuItem onClick={() => setMode('level')}>Add existing level</MenuItem>
      </Menu>

      <Popover anchorEl={anchorEl} open={mode === 'content'} onClose={close}>
        <ContentComposer
          submitLabel="Insert"
          onCancel={close}
          onSubmit={async ({title, markdown}) => {
            await authoringApi.applyChange({
              op: 'insertExperience',
              lessonId,
              experience: {
                id: draftExperienceId(),
                origin: 'draft',
                kind: 'content',
                ...(title ? {title} : {}),
                markdown,
              },
              position,
            });
            close();
          }}
        />
      </Popover>

      <Popover anchorEl={anchorEl} open={mode === 'level'} onClose={close}>
        <LevelSearch
          onCancel={close}
          onPick={async level => {
            await authoringApi.applyChange({
              op: 'attachExistingLevel',
              lessonId,
              levelKey: level.levelKey,
              position,
            });
            close();
          }}
        />
      </Popover>
    </div>
  );
}

const SEARCH_DEBOUNCE_MS = 300;

function LevelSearch({
  onCancel,
  onPick,
}: {
  onCancel: () => void;
  onPick: (level: {levelKey: string; levelType: string}) => Promise<void>;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<
    {levelKey: string; levelType: string}[]
  >([]);
  const [searching, setSearching] = useState(false);
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEscapeKeyHandler(onCancel);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      authoringApi
        .searchLevels(q)
        .then(setResults)
        .catch(() => setError('Level search failed.'))
        .finally(() => setSearching(false));
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const pick = async (level: {levelKey: string; levelType: string}) => {
    if (picking) {
      return;
    }
    setPicking(true);
    setError(null);
    try {
      await onPick(level);
    } catch {
      setError('That change failed to apply.');
      setPicking(false);
    }
  };

  return (
    <div className={styles.levelSearch}>
      <input
        ref={inputRef}
        aria-label="Search existing levels"
        placeholder="Search levels…"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      {searching && <Typography variant="body4">Searching…</Typography>}
      {!searching && query.trim() && results.length === 0 && (
        <Typography variant="body4">No levels match “{query}”.</Typography>
      )}
      <ul className={styles.levelSearchResults}>
        {results.map(level => (
          <li key={level.levelKey}>
            <button
              type="button"
              className={styles.levelSearchResult}
              disabled={picking}
              onClick={() => void pick(level)}
            >
              <Typography variant="body4" component="span">
                {level.levelKey}
              </Typography>
              <Tags tagsList={[{label: level.levelType}]} size="s" />
            </button>
          </li>
        ))}
      </ul>
      {error && (
        <Typography
          variant="body4"
          role="status"
          className={styles.inlineError}
        >
          {error}
        </Typography>
      )}
    </div>
  );
}
