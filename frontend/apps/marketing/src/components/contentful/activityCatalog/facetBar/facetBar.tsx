'use client';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import {Chip, MenuItem, Select} from '@mui/material';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import {FacetResult} from '@orama/orama';
import {ChangeEvent} from 'react';

import {FACET_LABELS} from '@/components/contentful/activityCatalog/config/facets';

interface FacetPanelProps {
  isInDrawer?: boolean;
  facets: FacetResult | undefined;
  selectedFacets: Record<string, Set<string>>;
  searchTerm: string | undefined;
  onFacetChange: (facet: string, facetValue: string) => void;
  onSearchTermChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClearAll: () => void;
}
const FacetBar = ({
  isInDrawer,
  facets,
  selectedFacets,
  searchTerm,
  onFacetChange,
  onClearAll,
  onSearchTermChange,
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
      <MenuItem key={facetValue} value={facetValue}>
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
        <FormControl
          key={facet}
          sx={{minWidth: 0, display: isInDrawer ? 'block' : 'inline-flex'}}
        >
          <Select
            aria-label={FACET_LABELS[facet]}
            multiple
            onChange={e => handleChange(facet, e.target.value[0])}
            value={[]}
            sx={theme => ({
              width: 'auto',
              minWidth: 'fit-content',
              '.MuiSelect-select': {
                width: 'auto',
                minWidth: 'fit-content',
                paddingRight: 4,
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
    <Grid container spacing={2} flexDirection={isInDrawer ? 'column' : 'row'}>
      <Grid size={isInDrawer ? 12 : 2}>
        <Input
          onChange={onSearchTermChange}
          value={searchTerm}
          placeholder={'Search...'}
        />
      </Grid>

      <Grid size={isInDrawer ? 12 : 10}>
        {getDropdowns()}

        <Button onClick={onClearAll}>Clear All</Button>
      </Grid>
    </Grid>
  );
};

export default FacetBar;
