'use client';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import {Chip, MenuItem, Select} from '@mui/material';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import {FacetResult} from '@orama/orama';

import {FACET_LABELS} from '@/components/contentful/activityCatalog/config/facets';

interface FacetPanelProps {
  facets: FacetResult | undefined;
  selectedFacets: Record<string, Set<string>>;
  onFacetChange: (facet: string, facetValue: string) => void;
  onClearAll: () => void;
}
const FacetBar = ({
  facets,
  selectedFacets,
  onFacetChange,
  onClearAll,
}: FacetPanelProps) => {
  if (!facets) {
    return null;
  }

  

  const handleChange = (facet: string, facetValue: string) => {
    onFacetChange(facet, facetValue);
  };

  const getDropdownMenuItem = (
    selectedFacetValues: Set<string>,
    facet: string,
    facetValue: string,
  ) => {
    const isSelected = selectedFacetValues?.has(facetValue);

    return (
      <MenuItem key={facetValue} value={facetValue}
      
      sx={{p: 0.4 }}>
        <Chip
        
          key={facetValue}
          label={facetValue}
          onDelete={
            isSelected ? () => handleChange(facet, facetValue) : undefined
          }
          deleteIcon={
            isSelected ? <CloseRoundedIcon fontSize="small" /> : undefined
          }
          variant={isSelected ? 'filled' : 'outlined'}
          color={isSelected ? 'primary' : 'default'}
          sx={{ fontSize: 14, height: 32,
            display: 'flex',
           }} 
        />
      </MenuItem>
    );
  };

  const getDropdowns = () => {
    return Object.entries(facets).map(([facet, facetDetails]) => {
      const facetValues = Object.keys(facetDetails.values);
      const hasSelectedValue =
        selectedFacets[facet] && selectedFacets[facet].size > 0;



      return (
        <FormControl key={facet}   sx={{
    minWidth: 0,
    '&:not(:last-of-type)': { mb: 1.25 },   // space between filter pills
  }}>
          <Select
            aria-label={FACET_LABELS[facet]}
            multiple
            onChange={e => handleChange(facet, e.target.value[0])}
            value={[]}
            sx={theme => ({
              width: '100px',
              minWidth: 'fit-content',
              '.MuiSelect-select': {
                width: '150px',
                height: 28,
                minWidth: 'fit-content',
                padding: 2,
                fontSize: 20,
                backgroundColor: hasSelectedValue
                  ? theme.palette.primary.main
                  : 'inherit',
                color: hasSelectedValue
                  ? theme.palette.common.white
                  : 'inherit',
              },
              '& .MuiSelect-icon': {
                color: hasSelectedValue
                  ? theme.palette.common.white
                  : theme.palette.action.active,
              },
  })}
  displayEmpty
  renderValue={() => <span>{FACET_LABELS[facet]}</span>}

  
  MenuProps={{
    PaperProps: {
      
      sx: theme => ({
        padding: 2,
         pb: { xs: 3, sm: 2 },                  // a bit more bottom padding on mobile
        boxShadow: 2, 
        paddingBottom: 2,
        backgroundColor: theme.palette.grey[100] ,
        borderRadius: 0.5,
        
      }),
    },
  }}


>
            {facetValues.map(facetValue => {
              return getDropdownMenuItem(
                selectedFacets[facet],
                facet,
                facetValue,
              );
            })}
          </Select>
        </FormControl>
      );
    });
  };





  

  return (
    <>
      {getDropdowns()}

      <Button
  onClick={onClearAll}
  sx={{
    borderRadius: 999,
    px: 2,
    mr: { xs: 'auto', sm: 0 },   // push LEFT on mobile
    ml: { xs: 0, sm: 'auto' },   // push RIGHT on ≥ sm
  }}
>
  Clear All
</Button>
    </>
  );
};

export default FacetBar;
