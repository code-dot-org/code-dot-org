'use client';
import * as React from 'react';
import {
  Box,
  Collapse,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FacetDropdown from './FacetDropdown';
import type { FacetResult } from '@orama/orama';

type Props = {
  facets: FacetResult | undefined;
  selectedFacets: Record<string, Set<string>>;
  onFacetSetChange: (facetKey: string, nextValues: Set<string>) => void;
  searchTerm: string;
  onSearchChange: (v: string) => void;
  onClearAll: () => void;
};

// Explicit labels for Orama facet keys
const LABELS: Record<string, string> = {
  ages: 'Ages',
  topic: 'Topics',
  activityType: 'Activity Type',
  languageProgramming: 'Programming Language',
  length: 'Length',
  accessibilitys: 'Accessibility',
  technologyClassroom: 'Classroom technology',
};

// First row shows only these (after the search input)
const ORDER_ROW1 = ['ages', 'technologyClassroom', 'topic'];
// Collapsed row shows these (plus any extras we don’t know about)
const ORDER_ROW2 = ['activityType', 'languageProgramming', 'length', 'accessibilitys'];

export default function FilterBar({
  facets,
  selectedFacets,
  onFacetSetChange,
  searchTerm,
  onSearchChange,
  onClearAll,
}: Props) {
  if (!facets) return null;

  const [showMore, setShowMore] = React.useState(false);
  const [anyDropdownOpen, setAnyDropdownOpen] = React.useState(false);

  const makeDropdown = (facetKey: string) => {
    const details = facets[facetKey];
    if (!details) return null;
    const options = Object.keys(details.values);
    return (
      <FacetDropdown
        key={facetKey}
        facetKey={facetKey}
        label={LABELS[facetKey] ?? facetKey}
        options={options}
        selected={selectedFacets[facetKey]}
        onChange={onFacetSetChange}
        onOpenChange={setAnyDropdownOpen} // tells us when a menu opens/closes
      />
    );
  };

  const known = new Set([...ORDER_ROW1, ...ORDER_ROW2]);
  const extras = Object.keys(facets).filter(k => !known.has(k));

  return (
<Box
  sx={{
    display: 'grid',
    gap: 1.5,
    mb: anyDropdownOpen ? 10 : 2, // ← more space: 80px when open
    transition: (t) =>
      t.transitions.create('margin-bottom', { duration: t.transitions.duration.shortest }),
  }}
>
      {/* ── Row 1: Search + primary facets + "View All Filters" toggle ── */}
      <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1.5} sx={{ width: '100%' }}>
        {/* Search (chip-like, grows) */}
        <TextField
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search"
          variant="outlined"
          size="medium"
          sx={{
            flex: '1 1 360px',
            minWidth: 260,
            maxWidth: 780,
            '& .MuiOutlinedInput-root': {
              borderRadius: 999,
              height: 44,
              pr: 1,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {ORDER_ROW1.map(makeDropdown)}

       {/* Right-aligned "View All Filters" text + icons */}
<Stack
  direction="row"
  alignItems="center"
  spacing={0.75}
  sx={{
    cursor: 'pointer',
    userSelect: 'none',
    ml: 'auto',
    color: 'primary.main',
  }}
  onClick={() => setShowMore(v => !v)}
>
  <Typography
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.5,
      fontSize: 12,        // <-- explicit 12px
      fontWeight: 500,
      lineHeight: 1.2,
    }}
  >
    <TuneIcon fontSize="inherit" />
    {showMore ? 'Hide Filters' : 'View All Filters'}
    <ExpandMoreIcon
      fontSize="inherit"
      sx={{
        transition: 'transform 0.15s ease',
        transform: showMore ? 'rotate(180deg)' : 'rotate(0deg)',
      }}
    />
  </Typography>
</Stack>

      </Stack>

      {/* ── Row 2: Collapsible rest of filters + Clear All ── */}
      <Collapse in={showMore} unmountOnExit>
        <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1.5}>
          {ORDER_ROW2.map(makeDropdown)}
          {extras.map(makeDropdown)}

          {/* Clear All as text link */}
          <Typography
            variant="body2"
            sx={{ ml: 0.5, cursor: 'pointer', color: 'primary.main', fontWeight: 500,fontSize: 12, lineHeight: 1.2, '&:hover': { textDecoration: 'underline' } }}

            onClick={onClearAll}
          >
            Clear All
          </Typography>
        </Stack>
      </Collapse>
    </Box>
  );
}
