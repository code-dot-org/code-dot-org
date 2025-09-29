'use client';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import {ComponentProps} from 'react';

import FacetBar from '@/components/contentful/activityCatalog/facetBar/facetBar';

type FacetDrawerProps = ComponentProps<typeof FacetBar> & {
  isOpen: boolean;
  onClose: () => void;
};

const FacetDrawer = ({isOpen, onClose, ...props}: FacetDrawerProps) => {
  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      anchor={'right'}
      slotProps={{
        paper: {
          sx: {
            width: {xs: '80%', sm: 500}, // explicit width
            maxWidth: '90vw', // never full screen on tiny devices
            overflow: 'auto',
          },
        },
      }}
    >
      <Button onClick={onClose}>Close</Button>
      <FacetBar {...props} isInDrawer={true} />
    </Drawer>
  );
};

export default FacetDrawer;
