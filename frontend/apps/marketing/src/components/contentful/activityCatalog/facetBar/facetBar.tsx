'use client';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
} from '@mui/material';
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
const FacetBar = ({facets, selectedFacets, onFacetChange}: FacetPanelProps) => {
  if (!facets) {
    return null;
  }

  const handleChange = (facet: string, facetValue: string) => {
    onFacetChange(facet, facetValue);
  };

  const getDropdowns = () => {
    return Object.entries(facets).map(([facet, facetDetails]) => {
      // Sort using localeCompare with numeric option for mixed strings/numbers
      const facetValues = Object.keys(facetDetails.values).sort((a, b) =>
        a.localeCompare(b, undefined, {numeric: true}),
      );

      return (
        <Accordion
          defaultExpanded
          sx={{
            bgcolor: 'card.main',
            color: 'card.contrastText',
            width: '100%',
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{color: 'foreground.main'}} />}
            sx={{padding: 1}}
          >
            <Typography variant="subtitle1" sx={{fontWeight: 600}}>
              {FACET_LABELS[facet]}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              {facetValues.map(facetValue => {
                return (
                  <FormControlLabel
                    key={facetValue}
                    control={
                      <Checkbox
                        checked={
                          selectedFacets[facet]?.has(facetValue) || false
                        }
                        onChange={() => handleChange(facet, facetValue)}
                        sx={{color: 'muted.contrastText'}}
                      />
                    }
                    label={
                      <Typography variant="body4">{facetValue}</Typography>
                    }
                  />
                );
              })}
            </FormGroup>
          </AccordionDetails>
        </Accordion>
      );
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        padding: 2,
      }}
    >
      {getDropdowns()}
    </Box>
  );
};

export default FacetBar;
