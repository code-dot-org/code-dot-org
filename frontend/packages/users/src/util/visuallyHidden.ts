// Screen-reader-only style for visually-hidden live regions. Matches MUI's
// `visuallyHidden`; kept local because @mui/utils isn't a direct dependency.
export const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const;
