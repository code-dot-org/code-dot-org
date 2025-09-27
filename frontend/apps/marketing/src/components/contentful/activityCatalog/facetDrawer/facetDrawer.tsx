'use client';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { Box, Typography } from '@mui/material';
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

    
    <Drawer open={isOpen} onClose={onClose} anchor={'right'} 
    PaperProps={{
      sx: { p: 2, 
        width: 360,
      borderTopLeftRadius: 20,
      borderBottomLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      overflow: 'hidden',
      border: 1,
      mt: 1,
      
      }, 
    }}>

       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      <FilterAltOutlinedIcon fontSize="small" color="primary" aria-hidden />
      <Typography component="h2" variant="h6" sx={{ m: 1 }}>
        Filters
      </Typography>
    </Box>


      <FacetBar {...props} />
       <Button onClick={onClose}
       sx={theme => ({
             
            justifySelf: 'center',
            borderRadius: 999,
            px: 2,
            height: 46,
            width: 10 ,
            color: '#fff',
            mt: 2,
            ml: 2,
            backgroundColor: theme.palette.secondary.dark,
            '&:hover': {backgroundColor: theme.palette.primary.main},
            textTransform: 'none',
            fontWeight: 600,
          })}
          >Go</Button>
    </Drawer>
  );
};

export default FacetDrawer;
