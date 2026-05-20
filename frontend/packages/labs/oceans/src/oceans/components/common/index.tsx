import Box from '@mui/material/Box';
import * as React from 'react';

import loadingGif from '@/assets/images/loading.gif';
import Button from '@/oceans/components/common/Button';
import ConfirmationDialog from '@/oceans/components/common/ConfirmationDialog';
import Guide from '@/oceans/components/common/Guide';
import guide from '@/oceans/models/guide';

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

    return (
      <Box
        sx={{position: 'relative', width: '100%', paddingTop: '56.25%'}}
        onClick={this.props.onClick as React.MouseEventHandler<HTMLElement>}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
          {...(modalGuide ? {inert: '' as const} : {})}
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
      sx={{
        position: 'absolute',
        transform: 'translate(-50%, -50%)',
        top: '50%',
        left: '50%',
        maxWidth: '30%',
      }}
      alt="Loading"
    />
  </Body>
);

export {Body, Content, Loading, Guide, Button, ConfirmationDialog};
