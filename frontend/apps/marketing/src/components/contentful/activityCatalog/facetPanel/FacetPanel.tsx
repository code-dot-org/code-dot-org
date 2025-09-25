import {FormControlLabel} from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import Typography from '@mui/material/Typography';
import {FacetResult} from '@orama/orama';
import {ChangeEvent} from 'react';

interface FacetPanelProps {
  facets: FacetResult | undefined;
  selectedFacets: Record<string, Set<string>>;
  onFacetChange: (facet: string, e: ChangeEvent<HTMLInputElement>) => void;
}
const FacetPanel = ({
  facets,
  selectedFacets,
  onFacetChange,
}: FacetPanelProps) => {
  if (!facets) {
    return null;
  }

  return Object.entries(facets).map(([facet, facetDetails]) => {
    return (
      <div key={facet}>
        <Typography variant={'body2'}>{facet}</Typography>

        <FormGroup
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onFacetChange(facet, e)
          }
        >
          {Object.keys(facetDetails.values).map(facetValue => {
            return (
              <FormControlLabel
                control={<Checkbox />}
                label={facetValue}
                name={facetValue}
                checked={
                  selectedFacets[facet]
                    ? selectedFacets[facet].has(facetValue)
                    : false
                }
              />
            );
          })}
        </FormGroup>
      </div>
    );
  });
};

export default FacetPanel;
