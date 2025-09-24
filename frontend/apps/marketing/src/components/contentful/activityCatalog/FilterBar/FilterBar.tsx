'use client';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import {
  Box,
  Button,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type {FacetResult} from '@orama/orama';
import * as React from 'react';

import FacetDropdown from './facetDropdown';

type Props = {
  facets: FacetResult | undefined;
  selectedFacets: Record<string, Set<string>>;
  onFacetSetChange: (facetKey: string, nextValues: Set<string>) => void;
  searchTerm: string;
  onSearchChange: (v: string) => void;
  onClearAll: () => void;
};

const LABELS: Record<string, string> = {
  ages: 'Ages',
  topic: 'Topics',
  activityType: 'Activity Type',
  languageProgramming: 'Programming Language',
  length: 'Length',
  accessibilitys: 'Accessibility',
  technologyClassroom: 'Classroom technology',
};

const ORDER_ROW1 = ['ages', 'technologyClassroom', 'topic'];
const ORDER_ROW2 = [
  'activityType',
  'languageProgramming',
  'length',
  'accessibilitys',
];

/* ----------------------- Sorting & overrides ----------------------- */
// Always include specific facet values even if dataset has 0 hits for them
const FACET_VALUE_OVERRIDES: Record<string, string[]> = {
  ages: ['5 and under'],
};

// Natural (alphanumeric) sort: numbers compared numerically, text A→Z
const NATURAL = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});
const sortOptions = (values: string[]) => [...values].sort(NATURAL.compare);

const buildOptions = (facetKey: string, facets: FacetResult) => {
  const details = facets[facetKey];
  if (!details) return null;
  const base = Object.keys(details.values ?? {});
  const extra = FACET_VALUE_OVERRIDES[facetKey] ?? [];
  const merged = Array.from(new Set([...extra, ...base]));
  return sortOptions(merged);
};
/* ------------------------------------------------------------------ */

export default function FilterBar({
  facets,
  selectedFacets,
  onFacetSetChange,
  searchTerm,
  onSearchChange,
  onClearAll,
}: Props) {
  if (!facets) return null;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Desktop state
  const [showMore, setShowMore] = React.useState(false);
  const [anyDropdownOpen, setAnyDropdownOpen] = React.useState(false);

  // Mobile Drawer state (draft values that apply on "Go")
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [draftSelected, setDraftSelected] = React.useState<
    Record<string, Set<string>>
  >({});
  const [draftTerm, setDraftTerm] = React.useState<string>('');

  // Ensure drawer doesn't auto-open when switching breakpoints
  React.useEffect(() => {
    setMobileOpen(false);
  }, [isMobile]);

  // Open drawer: clone current selections into drafts
  const openDrawer = () => {
    const clone: Record<string, Set<string>> = {};
    Object.entries(selectedFacets).forEach(([k, v]) => (clone[k] = new Set(v)));
    setDraftSelected(clone);
    setDraftTerm(searchTerm);
    setMobileOpen(true);
  };

  const applyDraftAndClose = () => {
    onSearchChange(draftTerm);
    const keys = new Set([
      ...Object.keys(facets || {}),
      ...Object.keys(draftSelected || {}),
      ...Object.keys(selectedFacets || {}),
    ]);
    keys.forEach(k => {
      const next = draftSelected[k] ?? new Set<string>();
      onFacetSetChange(k, next);
    });
    setMobileOpen(false);
  };

  const makeDropdown = (facetKey: string) => {
    const options = buildOptions(facetKey, facets);
    if (!options) return null;
    return (
      <FacetDropdown
        key={facetKey}
        facetKey={facetKey}
        label={LABELS[facetKey] ?? facetKey}
        options={options}
        selected={selectedFacets[facetKey]}
        onChange={onFacetSetChange}
        onOpenChange={setAnyDropdownOpen}
      />
    );
  };

  const makeMobileDropdown = (facetKey: string) => {
    const options = buildOptions(facetKey, facets);
    if (!options) return null;
    const selected = draftSelected[facetKey];
    return (
      <FacetDropdown
        key={facetKey}
        facetKey={facetKey}
        label={LABELS[facetKey] ?? facetKey}
        options={options}
        selected={selected}
        onChange={(_, next) =>
          setDraftSelected(prev => ({...prev, [facetKey]: new Set(next)}))
        }
        variant="inline"
        onOpenChange={() => {}}
      />
    );
  };

  const known = new Set([...ORDER_ROW1, ...ORDER_ROW2]);
  const extras = Object.keys(facets).filter(k => !known.has(k));

  // MOBILE: Filter button + Drawer
  if (isMobile) {
    const mobileKeys = [...ORDER_ROW1, ...ORDER_ROW2, ...extras];
    const lastKey = mobileKeys[mobileKeys.length - 1];
    const restKeys = mobileKeys.slice(0, -1);

    const clearAllDraft = () => {
      const cleared: Record<string, Set<string>> = {};
      Object.keys(facets).forEach(k => (cleared[k] = new Set()));
      setDraftSelected(cleared);
      setDraftTerm('');
    };

    return (
      <>
        <Box sx={{display: 'grid', gap: 1, mt: -5, mb: 1}}>
          <Button
            onClick={openDrawer}
            startIcon={<FilterAltRoundedIcon />}
            sx={{
              justifySelf: 'center',
              borderRadius: 999,
              px: 2,
              height: 40,
              color: '#fff',
              bgcolor: '#ca01e4',
              '&:hover': {bgcolor: '#ca01e4'},
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Filter
          </Button>
        </Box>

        <Drawer
          anchor="right"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          PaperProps={{
            sx: {
              width: '88vw',
              maxWidth: 420,
              height: '100dvh',
              borderRadius: '12px 0 0 12px',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            },
          }}
        >
          {/* Header */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{mb: 1}}
          >
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <FilterAltRoundedIcon />
              <Typography variant="subtitle1" fontWeight={700}>
                Filter Activities
              </Typography>
            </Stack>
            <IconButton onClick={() => setMobileOpen(false)} size="small">
              <CloseRoundedIcon />
            </IconButton>
          </Stack>

          <Divider sx={{mb: 1.5}} />

          {/* Scrollable content */}
          <Box
            sx={{
              flex: '1 1 auto',
              overflowY: 'auto',
              pb: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
            }}
          >
            {/* Search */}
            <TextField
              value={draftTerm}
              onChange={e => setDraftTerm(e.target.value)}
              placeholder="Search"
              variant="outlined"
              fullWidth
              sx={{
                mb: 1.25,
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

            <Stack direction="column" gap={1}>
              {restKeys.map(makeMobileDropdown)}
            </Stack>

            {lastKey && (
              <Box
                sx={{
                  mt: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 1,
                }}
              >
                <Box>{makeMobileDropdown(lastKey)}</Box>
                <Typography
                  variant="caption"
                  sx={{
                    cursor: 'pointer',
                    color: 'primary.main',
                    fontWeight: 500,
                    fontSize: 10,
                    lineHeight: 1.1,
                    '&:hover': {textDecoration: 'underline'},
                  }}
                  onClick={clearAllDraft}
                >
                  Clear All
                </Typography>
              </Box>
            )}

            {/* Footer: "Go" on the LEFT */}
            <Box sx={{mt: 2, display: 'flex', justifyContent: 'flex-start'}}>
              <Button
                onClick={applyDraftAndClose}
                sx={{
                  borderRadius: 999,
                  px: 3,
                  height: 40,
                  color: '#fff',
                  bgcolor: '#ca01e4',
                  '&:hover': {bgcolor: '#ca01e4'},
                  textTransform: 'none',
                  fontWeight: 700,
                  boxShadow: 'none',
                }}
              >
                Go
              </Button>
            </Box>
          </Box>
        </Drawer>
      </>
    );
  }

  // DESKTOP / TABLET
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1,
        mt: {xs: 0, sm: -2},
        mb:
          !isMobile && anyDropdownOpen
            ? showMore
              ? 16
              : 10
            : showMore
              ? 10
              : 6,
        transition: t =>
          t.transitions.create('margin-bottom', {
            duration: t.transitions.duration.shortest,
          }),
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        flexWrap="wrap"
        gap={1.5}
        sx={{width: '100%'}}
      >
        <TextField
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
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
              fontSize: 12,
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

      <Collapse in={showMore} unmountOnExit>
        <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1.5}>
          {ORDER_ROW2.map(makeDropdown)}
          {extras.map(makeDropdown)}
          <Typography
            variant="caption"
            sx={{
              ml: 0.5,
              cursor: 'pointer',
              color: 'primary.main',
              fontWeight: 300,
              lineHeight: 1.2,
              fontSize: 6,
              '&:hover': {textDecoration: 'underline'},
            }}
            onClick={onClearAll}
          >
            Clear All
          </Typography>
        </Stack>
      </Collapse>
    </Box>
  );
}
