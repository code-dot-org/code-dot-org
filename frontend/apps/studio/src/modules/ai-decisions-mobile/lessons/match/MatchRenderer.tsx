/**
 * MatchRenderer — sort-items-into-bins level renderer.
 *
 * Designed for K-5 touch: **tap-an-item, then tap-a-bin** (no drag).
 * Drag-and-drop on phones produces too many "missed drop" failures for
 * small hands; tap-tap gives each action two clear confirmations and
 * survives sluggish 2 GB Android devices without precise pointer
 * handling.
 *
 * Per FR-008: wrong drops bounce back to the tray with a soft non-
 * verbal sting; never red error text.  Right drops settle into the
 * bin with a 200 ms scale-and-fade.  When every item is in its
 * correct bin, fire onComplete(true).
 */

import {Box, Typography} from '@mui/material';
import {useState, useCallback, useEffect, useMemo} from 'react';

import type {Level} from '../../content/types';
import {useString} from '../../i18n/StringsProvider';

/** Schema for an item the learner has to place into a bin.
 * `imageUrl` and `emoji` are mutually exclusive; imageUrl wins when both
 * are present.  Image URLs point at the prod sprite CDN. */
interface MatchItem {
  /** Stable identifier within the level. */
  key: string;
  /** Emoji rendered as the item's visible body (no asset dependency). */
  emoji?: string;
  /** URL to a sprite image (prod CDN).  Rendered as <img> when set. */
  imageUrl?: string;
  /** Key of the bin this item belongs to.  Stored in payload, not surfaced. */
  binKey: string;
}

/** Schema for a destination bin. */
interface MatchBin {
  /** Stable identifier matched against item.binKey. */
  key: string;
  /** Strings.json key for the bin's label (localized). */
  labelKey: string;
}

/** Full match payload (new bins-based schema). */
interface MatchPayload {
  /** Strings.json key for the top-of-level prompt. */
  promptKey: string;
  bins: MatchBin[];
  items: MatchItem[];
}

export interface MatchRendererProps {
  level: Level;
  onComplete: (perfect: boolean) => void;
}

/**
 * Type guard: does the level's payload use the new bins schema?
 * Legacy levels (ch4–ch6 today) still use the 1:1 items+targetKey shape;
 * they'll render the "coming soon" placeholder below until their content
 * is updated.
 */
function isBinsPayload(payload: unknown): payload is MatchPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    Array.isArray((payload as MatchPayload).bins) &&
    Array.isArray((payload as MatchPayload).items)
  );
}

/** Tracks where each item currently sits: in the tray, in a bin, or being shaken. */
type ItemPlacement = 'tray' | 'shake' | string; // string = binKey when placed

/** Detects items that should render as full-frame photographic cards
 * rather than 64×64 emoji circles. */
function hasImageItems(items: MatchItem[]): boolean {
  return items.some(it => !!it.imageUrl);
}

/** Match (tap-into-bins) renderer for `kind: 'match'` levels. */
export function MatchRenderer({level, onComplete}: MatchRendererProps) {
  const getString = useString;
  if (!isBinsPayload(level.payload)) {
    return <LegacyMatchPlaceholder onComplete={onComplete} />;
  }
  return (
    <BinsMatchRenderer
      payload={level.payload}
      getString={getString}
      onComplete={onComplete}
    />
  );
}

/** Placeholder for legacy match levels still on the old 1:1 schema. */
function LegacyMatchPlaceholder({
  onComplete,
}: {
  onComplete: (perfect: boolean) => void;
}) {
  return (
    <Box sx={{padding: 3, textAlign: 'center'}}>
      <Typography variant="body1" color="text.secondary">
        Content coming soon for this level.
      </Typography>
      <Box
        component="button"
        onClick={() => onComplete(true)}
        sx={{
          marginTop: 2,
          padding: '10px 20px',
          borderRadius: 2,
          border: 'none',
          backgroundColor: 'primary.main',
          color: 'common.white',
          fontSize: '1rem',
          cursor: 'pointer',
        }}
      >
        Continue
      </Box>
    </Box>
  );
}

/** The active tap-into-bins renderer. */
function BinsMatchRenderer({
  payload,
  getString,
  onComplete,
}: {
  payload: MatchPayload;
  getString: (key: string) => string;
  onComplete: (perfect: boolean) => void;
}) {
  /** Map of itemKey → current placement (`tray` / `shake` / `<binKey>`). */
  const [placements, setPlacements] = useState<Record<string, ItemPlacement>>(
    () =>
      Object.fromEntries(
        payload.items.map(it => [it.key, 'tray' as ItemPlacement]),
      ),
  );
  /** The item currently selected by the learner (awaiting a bin tap). */
  const [selectedItemKey, setSelectedItemKey] = useState<string | null>(null);

  /** Number of items remaining in the tray (drives the completion check). */
  const trayCount = useMemo(
    () =>
      Object.values(placements).filter(p => p === 'tray' || p === 'shake')
        .length,
    [placements],
  );

  /** Lookup helpers. */
  const itemByKey = useMemo(
    () => Object.fromEntries(payload.items.map(it => [it.key, it])),
    [payload.items],
  );

  const handleItemTap = useCallback(
    (itemKey: string) => {
      // Already placed; ignore (replay would require dragging out, out of scope).
      if (placements[itemKey] !== 'tray' && placements[itemKey] !== 'shake')
        return;
      // Toggle selection: tapping the selected item again deselects it.
      setSelectedItemKey(prev => (prev === itemKey ? null : itemKey));
    },
    [placements],
  );

  const handleBinTap = useCallback(
    (binKey: string) => {
      if (!selectedItemKey) return;
      const item = itemByKey[selectedItemKey];
      if (!item) return;
      if (item.binKey === binKey) {
        // Correct placement — settle into the bin.  Updater is PURE;
        // the "all-done → onComplete" effect is handled in the useEffect
        // below.  Side effects in state updaters double-fire under React
        // StrictMode and lead to subtle "celebration didn't fire" bugs.
        setPlacements(prev => ({...prev, [selectedItemKey]: binKey}));
        setSelectedItemKey(null);
      } else {
        // Wrong bin — shake the item and deselect.  FR-008: no red text.
        setPlacements(prev => ({...prev, [selectedItemKey]: 'shake'}));
        setSelectedItemKey(null);
        setTimeout(() => {
          setPlacements(prev => {
            // Only revert to tray if still in shake (item wasn't replaced).
            if (prev[selectedItemKey] !== 'shake') return prev;
            return {...prev, [selectedItemKey]: 'tray'};
          });
        }, 450);
      }
    },
    [selectedItemKey, itemByKey],
  );

  const allDone = trayCount === 0;

  // When every item is in a bin, fire onComplete on the next tick.
  // We used to delay 600 ms for a "done" beat, but during that window
  // the LessonChrome back chevron is still tappable — and if the
  // learner backed out before the timer, progress never saved.  The
  // parent's LevelCompleteBeat handles the celebratory pause now, so
  // there's nothing for MatchRenderer to wait for.
  useEffect(() => {
    if (!allDone) return;
    onComplete(true);
  }, [allDone, onComplete]);

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, padding: 2}}>
      <Typography variant="body1" textAlign="center" color="text.secondary">
        {allDone
          ? getString(level_done_key(payload))
          : payload.promptKey
            ? getString(payload.promptKey)
            : ''}
      </Typography>

      {/* Tray — unsorted items.  Items in bins are removed from this row.
       *  Image items: 2-col grid so 4 items form a 2×2 (~140 px tall
       *  each) instead of a vertical stack that blows past the fold.
       *  Emoji items: tight wrap row at 64×64. */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: hasImageItems(payload.items)
            ? 'repeat(2, 1fr)'
            : 'repeat(auto-fill, 64px)',
          justifyContent: 'center',
          gap: 1,
          padding: 1,
          backgroundColor: 'rgba(0,0,0,0.04)',
          borderRadius: 2,
        }}
      >
        {payload.items.map(item => {
          const placement = placements[item.key];
          if (placement !== 'tray' && placement !== 'shake') return null;
          const isSelected = selectedItemKey === item.key;
          const isShaking = placement === 'shake';
          const isImage = !!item.imageUrl;
          return (
            <Box
              key={item.key}
              component="button"
              onClick={() => handleItemTap(item.key)}
              aria-label={item.key}
              aria-pressed={isSelected}
              sx={{
                fontSize: '2.25rem',
                // Image items: full-width card.  Emoji items: 64×64 circle.
                width: isImage ? '100%' : 64,
                height: isImage ? 'auto' : 64,
                padding: isImage ? 0.5 : 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: isImage ? 2 : '50%',
                border: '3px solid',
                borderColor: isSelected ? 'primary.main' : 'transparent',
                backgroundColor: isSelected ? 'primary.light' : 'common.white',
                cursor: 'pointer',
                transition:
                  'transform 0.15s, border-color 0.15s, background-color 0.15s',
                transform: isSelected
                  ? isImage
                    ? 'scale(1.02)'
                    : 'scale(1.1)'
                  : 'scale(1)',
                animation: isShaking ? 'matchShake 0.4s ease-in-out' : 'none',
                '@keyframes matchShake': {
                  '0%, 100%': {transform: 'translateX(0)'},
                  '25%': {transform: 'translateX(-8px)'},
                  '75%': {transform: 'translateX(8px)'},
                },
              }}
            >
              {item.imageUrl ? (
                <Box
                  component="img"
                  src={item.imageUrl}
                  alt=""
                  sx={{
                    width: '100%',
                    // Compact tile so 4 items in a 2×2 grid fit above
                    // the fold (≤ 320 px total tray height).
                    maxHeight: 96,
                    objectFit: 'contain',
                    borderRadius: 1.5,
                    pointerEvents: 'none',
                  }}
                />
              ) : (
                item.emoji
              )}
            </Box>
          );
        })}
        {trayCount === 0 && (
          <Typography variant="body2" color="text.disabled" sx={{padding: 1}}>
            ✓
          </Typography>
        )}
      </Box>

      {/* Bins. */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${payload.bins.length}, 1fr)`,
          gap: 1.5,
        }}
      >
        {payload.bins.map(bin => {
          const itemsInBin = payload.items.filter(
            it => placements[it.key] === bin.key,
          );
          const armed = selectedItemKey !== null;
          return (
            <Box
              key={bin.key}
              component="button"
              onClick={() => handleBinTap(bin.key)}
              aria-label={getString(bin.labelKey)}
              disabled={!armed}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                padding: 1.5,
                minHeight: 140,
                borderRadius: 2,
                border: '3px dashed',
                borderColor: armed ? 'primary.main' : 'grey.300',
                backgroundColor: armed
                  ? 'rgba(33, 150, 243, 0.06)'
                  : 'transparent',
                cursor: armed ? 'pointer' : 'default',
                transition: 'border-color 0.2s, background-color 0.2s',
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{fontWeight: 700, textTransform: 'none'}}
              >
                {getString(bin.labelKey)}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.5,
                  justifyContent: 'center',
                  flex: 1,
                  alignItems: 'center',
                }}
              >
                {itemsInBin.map(it => (
                  <Box
                    key={it.key}
                    component={it.imageUrl ? 'img' : 'span'}
                    src={it.imageUrl}
                    alt=""
                    sx={{
                      fontSize: '1.75rem',
                      lineHeight: 1,
                      width: it.imageUrl ? 36 : undefined,
                      height: it.imageUrl ? 36 : undefined,
                      objectFit: 'contain',
                      animation: 'matchSettle 0.3s ease-out',
                      '@keyframes matchSettle': {
                        from: {transform: 'scale(0.5)', opacity: 0},
                        to: {transform: 'scale(1)', opacity: 1},
                      },
                    }}
                  >
                    {it.imageUrl ? null : it.emoji}
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

/**
 * Strings convention: each level's "all sorted" success message lives at
 * `<levelId>.done`.  We don't have the level id in the payload, so derive
 * the key from the first item's binKey suffix as a fallback if needed.
 * For now, just use the conventional `<promptKey-prefix>.done` derivation.
 */
function level_done_key(payload: MatchPayload): string {
  // `ch1.prompt` → `ch1.done`.  Guard against payloads without a
  // promptKey (legacy or generator fallback emits an empty stub).
  const promptPrefix = (payload.promptKey ?? 'level.prompt').replace(
    /\.prompt$/,
    '',
  );
  return `${promptPrefix}.done`;
}
