import {Button, Menu, MenuItem, Popover, Typography} from '@mui/material';
import {useCallback, useEffect, useRef, useState} from 'react';

import {useEscapeKeyHandler} from '@code-dot-org/component-library/common/hooks';
import Tags from '@code-dot-org/component-library/tags';

import {authoringApi, draftExperienceId} from '../api';
import type {LevelCatalogEntry, LevelFamily} from '../api';

import ContentComposer from './ContentComposer';

import styles from './authoring.module.scss';

type Mode = 'menu' | 'content' | 'level' | 'newMaze' | null;

// Mirrors the server's CREATABLE_MAZE_SKINS (authoring-service's
// mazeLevel.ts) — kept as its own copy for the same reason
// PropertiesPanel's START_DIRECTION_OPTIONS is: this package can't import
// server-only source, and the two only need to stay structurally
// compatible. Harvester/Planter are excluded there (and here) because
// their Cell subclasses don't support the legacy `maze`-only grid a fresh
// template starts with — see buildBlankMazeLevelDefinition's doc comment.
const NEW_MAZE_SKIN_OPTIONS = [
  {value: 'birds', label: 'Maze (plain)'},
  {value: 'farmer', label: 'Farmer'},
  {value: 'bee', label: 'Bee'},
  {value: 'collector', label: 'Collector'},
] as const;

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
        <MenuItem onClick={() => setMode('newMaze')}>New maze level</MenuItem>
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

      <Popover anchorEl={anchorEl} open={mode === 'newMaze'} onClose={close}>
        <NewMazeLevelForm
          onCancel={close}
          onSubmit={async params => {
            await authoringApi.createMazeLevel({
              lessonId,
              position,
              ...params,
            });
            close();
          }}
        />
      </Popover>
    </div>
  );
}

const DEFAULT_GRID_SIZE = 8;

/**
 * "New maze level" — a manual create affordance alongside "Add existing
 * level" (gap #5 of the parity challenge: there was no way to author a
 * maze level from scratch through the UI, only via chat). Creates a
 * minimal, already-solvable template (buildBlankMazeLevelDefinition,
 * authoring-service's mazeLevel.ts) through the same createMazeLevel
 * orchestration the AI's create_level tool uses, so the result is
 * immediately mounted and editable by the visual editor — the author
 * paints the real map from there.
 */
function NewMazeLevelForm({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (params: {
    title?: string;
    skin: string;
    rows: number;
    cols: number;
  }) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [skin, setSkin] = useState<string>(NEW_MAZE_SKIN_OPTIONS[0].value);
  const [rows, setRows] = useState(DEFAULT_GRID_SIZE);
  const [cols, setCols] = useState(DEFAULT_GRID_SIZE);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEscapeKeyHandler(onCancel);

  const submit = async () => {
    if (busy) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSubmit({title: title.trim() || undefined, skin, rows, cols});
    } catch {
      setError('That level failed to create.');
      setBusy(false);
    }
  };

  return (
    <form
      className={styles.propertiesPanelForm}
      onSubmit={e => {
        e.preventDefault();
        void submit();
      }}
    >
      <label htmlFor="new-maze-title">
        Title
        <input
          id="new-maze-title"
          value={title}
          placeholder="New maze level"
          onChange={e => setTitle(e.target.value)}
        />
      </label>
      <label htmlFor="new-maze-skin">
        Skin
        <select
          id="new-maze-skin"
          value={skin}
          onChange={e => setSkin(e.target.value)}
        >
          {NEW_MAZE_SKIN_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor="new-maze-rows">
        Rows
        <input
          id="new-maze-rows"
          type="number"
          min={2}
          max={20}
          value={rows}
          onChange={e => setRows(Number(e.target.value))}
        />
      </label>
      <label htmlFor="new-maze-cols">
        Columns
        <input
          id="new-maze-cols"
          type="number"
          min={2}
          max={20}
          value={cols}
          onChange={e => setCols(Number(e.target.value))}
        />
      </label>
      {error && (
        <Typography variant="body4" role="status" className={styles.inlineError}>
          {error}
        </Typography>
      )}
      <div className={styles.composerActions}>
        <Button variant="outlined" size="small" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" size="small" disabled={busy}>
          Create
        </Button>
      </div>
    </form>
  );
}

const SEARCH_DEBOUNCE_MS = 300;

function LevelSearch({
  onCancel,
  onPick,
}: {
  onCancel: () => void;
  onPick: (level: LevelCatalogEntry) => Promise<void>;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LevelFamily[]>([]);
  const [searching, setSearching] = useState(false);
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Separate from `error` (the attach-existing-level failure below): a
  // search failure needs its own retry affordance, not just a message —
  // see the effect's comment for why "intermittent, until reload" made
  // this worth a dedicated retry rather than "type again to re-trigger
  // the debounce".
  const [searchError, setSearchError] = useState<string | null>(null);
  const [variantsMenu, setVariantsMenu] = useState<{
    familyKey: string;
    anchorEl: HTMLElement;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEscapeKeyHandler(onCancel);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Extracted so the "Retry" button can re-run exactly this attempt
  // without the author having to retype the query — the underlying
  // failure (see server.ts's keepAliveTimeout comment) was intermittent
  // and unrelated to what was typed, so retyping was never what fixed it.
  const runSearch = useCallback((q: string) => {
    setSearching(true);
    setSearchError(null);
    authoringApi
      .searchLevels(q)
      .then(setResults)
      .catch(() => setSearchError('Level search failed.'))
      .finally(() => setSearching(false));
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setSearchError(null);
      return;
    }
    const timer = setTimeout(() => runSearch(q), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, runSearch]);

  const pick = async (level: LevelCatalogEntry) => {
    if (picking) {
      return;
    }
    setVariantsMenu(null);
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
      {searchError && (
        <div className={styles.levelSearchError}>
          <Typography
            variant="body4"
            role="status"
            className={styles.inlineError}
          >
            {searchError}
          </Typography>
          <Button
            type="button"
            size="small"
            variant="outlined"
            onClick={() => runSearch(query.trim())}
          >
            Retry
          </Button>
        </div>
      )}
      {!searching && !searchError && query.trim() && results.length === 0 && (
        <Typography variant="body4">No levels match “{query}”.</Typography>
      )}
      <ul className={styles.levelSearchResults}>
        {results.map(family => (
          <li key={family.familyKey} className={styles.levelSearchResultRow}>
            <button
              type="button"
              className={styles.levelSearchResult}
              disabled={picking}
              onClick={() => void pick(family.defaultVariant)}
            >
              <Typography variant="body4" component="span">
                {family.defaultVariant.levelKey}
              </Typography>
              <Tags
                tagsList={[{label: family.defaultVariant.levelType}]}
                size="s"
              />
            </button>
            {family.variantCount > 1 && (
              <button
                type="button"
                className={styles.levelSearchVariantsToggle}
                aria-label={`${family.variantCount} versions of ${family.familyKey}`}
                aria-haspopup="menu"
                aria-expanded={variantsMenu?.familyKey === family.familyKey}
                disabled={picking}
                onClick={e =>
                  setVariantsMenu({
                    familyKey: family.familyKey,
                    anchorEl: e.currentTarget,
                  })
                }
              >
                <Typography variant="body4" component="span">
                  {family.variantCount} versions
                </Typography>
              </button>
            )}
            {family.variantCount > 1 && (
              <Menu
                anchorEl={variantsMenu?.anchorEl}
                open={variantsMenu?.familyKey === family.familyKey}
                onClose={() => setVariantsMenu(null)}
              >
                {family.variants.map(variant => (
                  <MenuItem
                    key={variant.levelKey}
                    disabled={picking}
                    onClick={() => void pick(variant)}
                  >
                    <Typography variant="body4" component="span">
                      {variant.levelKey}
                    </Typography>
                  </MenuItem>
                ))}
              </Menu>
            )}
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
