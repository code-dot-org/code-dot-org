'use client';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchIcon from '@mui/icons-material/Search';
import {Chip, MenuItem, Select} from '@mui/material';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import {FacetResult} from '@orama/orama';
import {ChangeEvent, useState} from 'react';

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

  const [openFacet, setOpenFacet] = useState<string | null>(null);

  const getDropdownMenuItem = (
    selectedFacetValues: Set<string>,
    facet: string,
    facetValue: string,
  ) => {
    const isSelected = selectedFacetValues?.has(facetValue);
    return (
      <MenuItem
        key={facetValue}
        value={facetValue}
        disableRipple
        sx={{
          '&, &:hover, &.Mui-focusVisible, &.Mui-selected, &.Mui-selected:hover':
            {
              backgroundColor: 'transparent',
            },
        }}
      >
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
          sx={{
            backgroundColor: !isSelected ? '#fff' : undefined,
            '&:hover': {backgroundColor: !isSelected ? '#fff' : undefined},
          }}
        />
      </MenuItem>
    );
  };

  const getDropdowns = () => {
    return Object.entries(facets).map(([facet, facetDetails]) => {
      // Sort using localeCompare with numeric option for mixed strings/numbers
      const facetValues = Object.keys(facetDetails.values).sort((a, b) =>
        a.localeCompare(b, undefined, {numeric: true}),
      );
      const hasSelectedValue =
        selectedFacets[facet] && selectedFacets[facet].size > 0;

      return (
        <FormControl
          key={facet}
          sx={{
            minWidth: 0,
            '&:not(:last-of-type)': {mb: 1.25, mr: 2},
          }}
        >
          <Select
            aria-label={FACET_LABELS[facet]}
            multiple
            onChange={e => handleChange(facet, e.target.value[0])}
            value={[]}
            open={openFacet === facet}
            onOpen={() => setOpenFacet(facet)}
            onClose={() => setOpenFacet(null)}
            MenuProps={{
              disableScrollLock: true,
              anchorOrigin: {vertical: 'bottom', horizontal: 'left'},
              transformOrigin: {vertical: 'top', horizontal: 'left'},
              PaperProps: {
                onMouseLeave: () => setOpenFacet(null),
                sx: theme => ({
                  p: {xs: 1, sm: 2},
                  pb: {xs: 1, sm: 2},
                  boxShadow: 2,
                  paddingBottom: 1,
                  backgroundColor: '#E9FAFF',
                  borderRadius: 0.5,
                  boxSizing: 'border-box',
                  overflow: 'auto',
                  zIndex: theme.zIndex.modal + 1,
                }),
              },
              MenuListProps: {
                dense: true,
                disablePadding: true,
                sx: {p: 0, m: 0, width: '100%'},
              },
            }}
            sx={theme => ({
              width: '100px',
              minWidth: 'fit-content',
              '.MuiSelect-select': {
                minWidth: 'fit-content',
                padding: 1.8,
                fontSize: 19,

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
    <Grid
      container
      spacing={isInDrawer ? 1 : 2}
      flexDirection={isInDrawer ? 'column' : 'row'}
    >
      <Grid size={isInDrawer ? 12 : 2}>
        <Input
          disableUnderline
          onChange={onSearchTermChange}
          value={searchTerm}
          placeholder="Search..."
          startAdornment={<SearchIcon fontSize="small" />}
          sx={{
            px: 2,
            py: 1.4,
            borderRadius: 999,
            border: '1px solid',
            borderColor: 'grey.400',
            backgroundColor: 'background.paper',
            fontSize: 19,
            width: 'calc(100% + 5px)',
          }}
        />
      </Grid>

      <Grid size={isInDrawer ? 12 : 10}>
        {getDropdowns()}
        <Button
          onClick={onClearAll}
          sx={{
            borderRadius: 999,
            py: 3,
            mr: {xs: 0, sm: 'auto'},
            ml: {xs: 0, sm: 0},
            pl: 4,
          }}
        >
          Clear All
        </Button>
      </Grid>
    </Grid>
  );
};

export default FacetBar;
