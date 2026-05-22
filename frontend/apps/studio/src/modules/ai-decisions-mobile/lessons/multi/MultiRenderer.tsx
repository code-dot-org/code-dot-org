/**
 * MultiRenderer — multiple-choice question level renderer.
 *
 * Renders an optional **evidence** panel (e.g. a snapshot of pre-sorted
 * bins to look at) above the question, then 2–4 option buttons.  The
 * evidence is the mobile translation of the desktop reference's "items
 * on the left, question on the right" split — on a phone, items go
 * above, question goes below.
 *
 * Selecting an option fires onComplete(perfect=true|false) after a
 * brief feedback beat.
 */

import {Box, Button, Typography} from '@mui/material';
import {useState} from 'react';

import type {Level} from '../../content/types';
import {useString} from '../../i18n/StringsProvider';
import {SpeakerAffordance} from '../../tts/SpeakerAffordance';
import {Markdown} from '../Markdown';

/** A bin in `evidence.type === 'sorted-bins'` — shows a label and the items in it.
 * `itemEmojis` and `itemImageUrls` are mutually exclusive; image URLs take
 * precedence when both are present.  Image URLs point at the prod sprite
 * CDN (`studio.code.org/api/v1/animation-library/...`). */
interface EvidenceSortedBin {
  key: string;
  labelKey: string;
  itemEmojis?: string[];
  itemImageUrls?: string[];
}

/** A point in `evidence.type === 'feature-grid'` — an emoji at a 2D coord (0-1). */
interface FeatureGridItem {
  emoji: string;
  /** 0 = left edge, 1 = right edge. */
  x: number;
  /** 0 = bottom edge, 1 = top edge. */
  y: number;
}

/** Evidence panel — visual context shown above the question. */
type MultiEvidence =
  | {
      type: 'sorted-bins';
      bins: EvidenceSortedBin[];
      /** Optional "subject" item to show prominently above the bins —
       * e.g. for prediction levels where the question asks where a
       * specific new item should go. */
      subject?: {labelKey?: string; imageUrl?: string; emoji?: string};
    }
  | {
      type: 'feature-grid';
      xAxis: {low: string; high: string};
      yAxis: {low: string; high: string};
      items: FeatureGridItem[];
    };

interface MultiPayload {
  questionKey: string;
  options: Array<{key: string; correct: boolean}>;
  /** Optional visual evidence rendered above the question (e.g. pre-sorted bins). */
  evidence?: MultiEvidence;
}

export interface MultiRendererProps {
  level: Level;
  onComplete: (perfect: boolean) => void;
}

/** Multiple-choice renderer for `kind: 'multi'` levels. */
export function MultiRenderer({level, onComplete}: MultiRendererProps) {
  const getString = useString;
  const payload = level.payload as MultiPayload;
  const [selected, setSelected] = useState<string | null>(null);
  const questionText = getString(payload.questionKey);

  function handleSelect(key: string, correct: boolean) {
    // Mark selection visually then fire onComplete on next tick.
    // No setTimeout — backing out of the lesson during the previous
    // 600 ms delay could orphan the in-flight write.  Parent's
    // LevelCompleteBeat handles the celebratory pause.
    setSelected(key);
    onComplete(correct);
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, padding: 2}}>
      {payload.evidence && (
        <EvidencePanel evidence={payload.evidence} getString={getString} />
      )}
      <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1}}>
        <Typography variant="h6" component="p" sx={{flex: 1}}>
          <Markdown text={questionText} />
        </Typography>
        <SpeakerAffordance
          text={questionText}
          ariaLabel="Read question aloud"
        />
      </Box>
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
        {payload.options.map(opt => (
          <Button
            key={opt.key}
            variant={selected === opt.key ? 'contained' : 'outlined'}
            onClick={() => handleSelect(opt.key, opt.correct)}
            disabled={selected !== null}
            sx={{justifyContent: 'flex-start', textAlign: 'left'}}
          >
            <Markdown text={getString(opt.key)} sx={{gap: 0}} />
          </Button>
        ))}
      </Box>
    </Box>
  );
}

/** Decides whether to stack bins vertically: any bin with a single
 * full-frame image looks too small in a side-by-side grid on a phone,
 * so stack them so each image gets the column's full width. */
function shouldStackBinsVertically(bins: EvidenceSortedBin[]): boolean {
  return bins.some(b => b.itemImageUrls && b.itemImageUrls.length === 1);
}

/** Renders the evidence panel above the question.  Pure presentational. */
function EvidencePanel({
  evidence,
  getString,
}: {
  evidence: MultiEvidence;
  getString: (key: string) => string;
}) {
  if (evidence.type === 'feature-grid') {
    return <FeatureGridEvidence evidence={evidence} getString={getString} />;
  }
  if (evidence.type === 'sorted-bins') {
    return (
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
        {/* Optional subject — the "predicted item" shown above the bins.
         *  E.g. L1 L3: "the circle with the black border and pink color". */}
        {evidence.subject && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              padding: 1,
              backgroundColor: 'rgba(33, 150, 243, 0.08)',
              border: '2px dashed',
              borderColor: 'primary.main',
              borderRadius: 2,
            }}
          >
            {evidence.subject.imageUrl ? (
              <Box
                component="img"
                src={evidence.subject.imageUrl}
                alt=""
                sx={{width: 44, height: 44, objectFit: 'contain'}}
              />
            ) : (
              <Box component="span" sx={{fontSize: '2rem', lineHeight: 1}}>
                {evidence.subject.emoji ?? '?'}
              </Box>
            )}
            {evidence.subject.labelKey && (
              <Typography variant="body2" sx={{fontWeight: 600}}>
                {getString(evidence.subject.labelKey)}
              </Typography>
            )}
          </Box>
        )}
        <Box
          sx={{
            display: 'flex',
            // When bins have full-frame images, stack vertically so each
            // image fills the column width.  Otherwise grid horizontally
            // for compact sprite/emoji evidence.
            flexDirection: shouldStackBinsVertically(evidence.bins)
              ? 'column'
              : 'row',
            gap: 1,
            padding: 1,
            backgroundColor: 'rgba(0,0,0,0.04)',
            borderRadius: 2,
            '& > *': shouldStackBinsVertically(evidence.bins)
              ? {}
              : {flex: 1, minWidth: 0},
          }}
        >
          {evidence.bins.map(bin => (
            <Box
              key={bin.key}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                padding: 0.75,
                borderRadius: 1.5,
                border: '2px solid',
                borderColor: 'grey.400',
                backgroundColor: 'common.white',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  textTransform: 'none',
                }}
              >
                {getString(bin.labelKey)}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.5,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {bin.itemImageUrls && bin.itemImageUrls.length > 0
                  ? bin.itemImageUrls.map((url, i) => {
                      // Single-image bin → full-frame illustration: stretch
                      // to the column width (L6 dog arrangements).
                      // Multi-image bin → small sprite tiles: 28×28 so
                      // 3 items fit on one row in a ~110 px column and
                      // the bin stays compact (~72 px tall total).
                      const isSingle = bin.itemImageUrls!.length === 1;
                      return (
                        <Box
                          key={i}
                          component="img"
                          src={url}
                          alt=""
                          sx={{
                            width: isSingle ? '100%' : 28,
                            height: isSingle ? 'auto' : 28,
                            maxHeight: isSingle ? 140 : 28,
                            objectFit: 'contain',
                            borderRadius: 1,
                          }}
                        />
                      );
                    })
                  : (bin.itemEmojis ?? []).map((emoji, i) => (
                      <Box
                        key={i}
                        component="span"
                        sx={{fontSize: '1.5rem', lineHeight: 1}}
                      >
                        {emoji}
                      </Box>
                    ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }
  return null;
}

/** Renders a 2D feature-vector grid with emoji items plotted by (x, y). */
function FeatureGridEvidence({
  evidence,
  getString,
}: {
  evidence: Extract<MultiEvidence, {type: 'feature-grid'}>;
  getString: (key: string) => string;
}) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 320,
        aspectRatio: '1 / 1',
        marginX: 'auto',
        backgroundColor: 'rgba(0,0,0,0.04)',
        borderRadius: 2,
        padding: 2,
        // Visual axes (cross through center).
        '&::before, &::after': {
          content: '""',
          position: 'absolute',
          backgroundColor: 'grey.400',
        },
        '&::before': {top: '50%', left: 8, right: 8, height: 1},
        '&::after': {left: '50%', top: 8, bottom: 8, width: 1},
      }}
    >
      {/* Axis labels — low/high anchors at the four edges. */}
      <Typography
        variant="body2"
        sx={{
          fontSize: '0.75rem',
          position: 'absolute',
          left: 8,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      >
        ←{getString(evidence.xAxis.low)}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontSize: '0.75rem',
          position: 'absolute',
          right: 8,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      >
        {getString(evidence.xAxis.high)}→
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontSize: '0.75rem',
          position: 'absolute',
          left: '50%',
          top: 8,
          transform: 'translateX(-50%)',
        }}
      >
        ↑{getString(evidence.yAxis.high)}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontSize: '0.75rem',
          position: 'absolute',
          left: '50%',
          bottom: 8,
          transform: 'translateX(-50%)',
        }}
      >
        {getString(evidence.yAxis.low)}↓
      </Typography>
      {/* Items plotted at (x, y) where (0,0)=bottom-left, (1,1)=top-right. */}
      {evidence.items.map((item, i) => (
        <Box
          key={i}
          aria-label={item.emoji}
          sx={{
            position: 'absolute',
            left: `calc(${item.x * 100}% - 1.25rem)`,
            bottom: `calc(${item.y * 100}% - 1.25rem)`,
            fontSize: '2.5rem',
            lineHeight: 1,
          }}
        >
          {item.emoji}
        </Box>
      ))}
    </Box>
  );
}
