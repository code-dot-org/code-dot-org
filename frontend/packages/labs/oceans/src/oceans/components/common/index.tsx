import {Box} from '@mui/material';
import * as React from 'react';

import loadingGif from '@/assets/images/loading.gif';
import Button from '@/oceans/components/common/Button';
import ConfirmationDialog from '@/oceans/components/common/ConfirmationDialog';
import Guide from '@/oceans/components/common/Guide';
import guide from '@/oceans/models/guide';
import {ASPECT_RATIO_16_9} from '@/oceans/styles/layout';

interface BodyProps {
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * 16:9 padded scaffold used by every scene.  When a modal guide is on
 * screen, marks the scene tree `inert` so screen readers / Tab focus
 * stay inside the dialog.
 */
class Body extends React.Component<BodyProps> {
  render() {
    const currentGuide = guide?.getCurrentGuide();
    const modalGuide = currentGuide && !currentGuide.noDimBackground;
    const shouldInert = modalGuide;

    return (
      <Box
        onClick={this.props.onClick}
        sx={{
          position: 'relative',
          width: '100%',
          paddingTop: ASPECT_RATIO_16_9,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
          // Cast: the prop is typed boolean but rendered as an HTML presence attribute.
          inert={(shouldInert ? '' : undefined) as unknown as boolean}
        >
          {this.props.children}
        </Box>
        <Guide />
      </Box>
    );
  }
}

interface ContentProps {
  children?: React.ReactNode;
}

/** Top-aligned absolute content container used by the Words scene. */
const Content = ({children}: ContentProps) => (
  <Box sx={{position: 'absolute', top: 0, left: 0, width: '100%'}}>
    {children}
  </Box>
);

/** Centered loading spinner.  Used while assets / models warm up. */
const Loading = () => (
  <Body>
    <Box
      component="img"
      src={loadingGif}
      alt="Loading"
      sx={{
        position: 'absolute',
        transform: 'translate(-50%, -50%)',
        top: '50%',
        left: '50%',
        maxWidth: '30%',
      }}
    />
  </Body>
);

export {Body, Content, Loading, Guide, Button, ConfirmationDialog};
