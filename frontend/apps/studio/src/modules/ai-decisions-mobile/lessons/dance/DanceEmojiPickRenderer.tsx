/**
 * DanceEmojiPickRenderer — Dance Party emoji-pick level.
 *
 * Four-step flow:
 *   1. pick   — learner taps 3 emoji from a grid (≥56dp targets)
 *   2. think  — ThinkingAnimation plays for ~1.5 s
 *   3. remix  — RemixOutput shows the chosen trio; learner taps "Celebrate!"
 *   4. burst  — ConfettiBurst overlay plays for 2.5 s then fires onComplete
 */

import {Box, Typography} from '@mui/material';
import {useState, useCallback, useEffect} from 'react';

import type {Level} from '../../content/types';

import {ConfettiBurst} from './ConfettiBurst';
import {RemixOutput} from './RemixOutput';
import {ThinkingAnimation} from './ThinkingAnimation';

const EMOJI_OPTIONS = ['🕺', '💃', '🤖', '🦄', '🎵', '⭐', '🌈', '🔥'];
const PICKS_REQUIRED = 3;

/** Step within the dance level flow. */
type DanceStep = 'pick' | 'think' | 'remix' | 'burst';

export interface DanceEmojiPickRendererProps {
  level: Level;
  onComplete: (perfect: boolean) => void;
}

/** Dance Party emoji-pick → thinking → remix → confetti level renderer. */
export function DanceEmojiPickRenderer({
  onComplete,
}: DanceEmojiPickRendererProps) {
  const testMode = new URLSearchParams(window.location.search).get('testStep');
  const [step, setStep] = useState<DanceStep>(
    (testMode as DanceStep) ?? 'pick',
  );
  const [picks, setPicks] = useState<string[]>(
    testMode === 'burst' || testMode === 'remix' ? ['🕺', '💃', '🤖'] : [],
  );

  const handleEmojiTap = useCallback((emoji: string) => {
    setPicks(prev => {
      if (prev.includes(emoji) || prev.length >= PICKS_REQUIRED) return prev;
      return [...prev, emoji];
    });
  }, []);

  // Advance to thinking step once all picks are collected (separate from updater).
  useEffect(() => {
    if (picks.length === PICKS_REQUIRED && step === 'pick') {
      setStep('think');
    }
  }, [picks.length, step]);

  const handleThinkDone = useCallback(() => setStep('remix'), []);
  const handleRemixContinue = useCallback(() => setStep('burst'), []);
  const handleBurstDone = useCallback(() => onComplete(true), [onComplete]);

  if (step === 'think')
    return <ThinkingAnimation onDone={handleThinkDone} durationMs={1500} />;
  if (step === 'remix')
    return <RemixOutput picks={picks} onContinue={handleRemixContinue} />;
  if (step === 'burst')
    return (
      <>
        <RemixOutput picks={picks} onContinue={() => {}} />
        <ConfettiBurst onDismiss={handleBurstDone} />
      </>
    );

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, padding: 2}}>
      <Typography variant="h6" textAlign="center">
        Pick {PICKS_REQUIRED} emoji for your dance remix
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        {picks.length} / {PICKS_REQUIRED} chosen
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1,
        }}
      >
        {EMOJI_OPTIONS.map(emoji => {
          const chosen = picks.includes(emoji);
          return (
            <Box
              key={emoji}
              component="button"
              data-testid="emoji-btn"
              onClick={() => handleEmojiTap(emoji)}
              aria-pressed={chosen}
              sx={{
                fontSize: '2rem',
                minWidth: 56,
                minHeight: 56,
                borderRadius: 1,
                border: '2px solid',
                borderColor: chosen ? 'primary.main' : 'grey.300',
                backgroundColor: chosen ? 'primary.light' : 'transparent',
                cursor: picks.length < PICKS_REQUIRED ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'border-color 0.15s, background-color 0.15s',
              }}
            >
              {emoji}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
