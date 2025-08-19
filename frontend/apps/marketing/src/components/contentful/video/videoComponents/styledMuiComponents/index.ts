import {styled} from '@mui/material/styles';

export const MuiVideoRoot = styled('figure', {
  name: 'MuiVideo',
  slot: 'root',
})(() => ({
  width: '100%',
  margin: 0,
}));

export const MuiVideoWrapper = styled('div', {
  name: 'MuiVideo',
  slot: 'wrapper',
})(() => ({
  position: 'relative',
  overflow: 'hidden',
  width: '100%',
  aspectRatio: '16 / 9', // Default aspect ratio for videos
  // border: 1px solid var(--background-neutral-tertiary);
  // border-radius: variables.$regular-border-radius;
  boxSizing: 'border-box',
  display: 'block',

  'iframe, video': {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
    border: 0,
  },
  '.cookieConsentButton': {
    marginTop: '1.5rem',
  },
}));

export const MuiVideoFacade = styled('div', {
  name: 'MuiVideo',
  slot: 'facade',
})({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundSize: 'cover',
  backgroundPosition: 'center center',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const MuiVideoPosterImage = styled('img', {
  name: 'MuiVideo',
  slot: 'posterImage',
})(() => ({
  height: '100%',
  width: '100%',
  objectFit: 'cover',
}));

export const MuiVideoErrorPlaceholder = styled('div', {
  name: 'MuiVideo',
  slot: 'errorPlaceholder',
})(() => ({
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  width: '100%',
  height: '100%',
  border: 0,
  boxSizing: 'border-box',
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  zindex: 1,

  svg: {
    fontSize: '3rem',
    marginBottom: '1rem',

    // Hide the icon on small screens to leave more space
    // for the text if it has a long translation.
    '@media (max-width: 320px)': {
      display: 'none',
    },
  },

  p: {
    margin: '0.25rem auto',
    textAlign: 'center',
  },
}));

export const MuiVideoFooter = styled('div', {
  name: 'MuiVideo',
  slot: 'footer',
})(() => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '1rem',
  marginTop: '6px',
  'a.video-download-button.MuiButtonBase-root': {
    '@media (max-width: 640px)': {
      display: 'none',
    },
  },
  // Align the download button to the right
  // when there is no caption shown.
  '&:not(:has(figcaption))': {
    justifyContent: 'flex-end',
  },
  'figcaption.MuiTypography-caption': {
    margin: 0,
  },
}));
