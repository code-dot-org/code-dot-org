'use client';

import { FacetResult, InternalTypedDocument, Orama, search } from '@orama/orama';
import { restore } from '@orama/plugin-data-persistence';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';

import Section from '@/components/contentful/section';
import ActivityCollection from '@/components/csforall/activityCollection/ActivityCollection';
import FilterBar from '@/components/contentful/activityCatalog/FilterBar/FilterBar';
import { ActivitySchema } from '@/modules/activityCatalog/orama/schema/ActivitySchema';
import { Activity } from '@/modules/activityCatalog/types/Activity';

interface ActivityCatalogProps {
  serializedOramaDb: string | ArrayBuffer | Buffer<ArrayBuffer>;
  activities: InternalTypedDocument<Activity>[];
  facets: FacetResult | undefined;
}

const ActivityCatalog = ({
  serializedOramaDb,
  activities,
  facets,
}: ActivityCatalogProps) => {
  // Allowed facet keys safeguard for URL params
  const allowedFacetSet = useMemo(
    () => new Set(facets ? Object.keys(facets) : []),
    [facets]
  );

  const [results, setResults] =
    useState<InternalTypedDocument<Activity>[]>(activities);

  const [db, setDb] = useState<Orama<typeof ActivitySchema> | undefined>(
    undefined
  );

  const [selectedFacets, setSelectedFacets] = useState<
    Record<string, Set<string>>
  >({});

  const [searchTerm, setSearchTerm] = useState<string>('');

  const router = useRouter();
  const searchParams = useSearchParams();

  // Restore Orama DB on client
  useEffect(() => {
    restore<Orama<typeof ActivitySchema>>('json', serializedOramaDb).then(
      restoredDb => {
        setDb(restoredDb);
        deserializeClientState();
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rehydrate when URL params change (after DB is ready)
  useEffect(() => {
    if (db) {
      deserializeClientState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, searchParams]);

  /** ---------- URL <-> State sync helpers ---------- */

  const deserializeClientState = () => {
    // term
    const termFromSearchParam = searchParams.get('term') || '';
    setSearchTerm(termFromSearchParam);

    // facets
    const facetsFromUrl = deserializeSelectedFacets(searchParams.toString());
    setSelectedFacets(facetsFromUrl);

    // results
    updateSearchResults(termFromSearchParam, facetsFromUrl);
  };

  const serializeClientState = (
    _searchTerm: string,
    _selectedFacets: Record<string, Set<string>>
  ) => {
    const params = new URLSearchParams();

    Object.entries(_selectedFacets).forEach(([facet, values]) => {
      if (values.size > 0) {
        const encodedValues = Array.from(values).map(v => encodeURIComponent(v));
        params.set(facet, encodedValues.join(','));
      }
    });

    const term = encodeURIComponent(_searchTerm);
    const qs = params.toString();
    router.push(qs ? `?term=${term}&${qs}` : `?term=${term}`);
  };

  const deserializeSelectedFacets = (
    query: string
  ): Record<string, Set<string>> => {
    const params = new URLSearchParams(query);
    const restored: Record<string, Set<string>> = {};

    params.forEach((value, key) => {
      if (!allowedFacetSet.has(key)) return;

      const decodedValues = value
        .split(',')
        .map(v => decodeURIComponent(v))
        .filter(Boolean);

      restored[key] = new Set(decodedValues);
    });

    // Ensure all known facets exist, even if empty (stable shape)
    allowedFacetSet.forEach(k => {
      if (!restored[k]) restored[k] = new Set();
    });

    return restored;
  };

  /** ---------- Search + facet logic ---------- */

  const updateSearchResults = async (
    term: string,
    searchFacets: Record<string, Set<string>>
  ) => {
    if (!db) return;

    // Convert Set -> string[] for Orama
    const facetFilters = Object.entries(searchFacets).reduce(
      (acc, [facetName, setValues]) => {
        if (setValues && setValues.size > 0) {
          acc[facetName] = Array.from(setValues);
        }
        return acc;
      },
      Object.create(null) as Record<string, string[]>
    );

    const searchResults = await search(db, {
      term,
      properties: ['title'],
      where: {
        ...facetFilters,
      },
    });

    setResults(searchResults.hits.map(hit => hit.document));
  };

  // Text search input (used by FilterBar)
  const onSearchChange = (v: string) => {
    setSearchTerm(v);
    serializeClientState(v, selectedFacets);
    updateSearchResults(v, selectedFacets);
  };

  // Checkbox change (legacy; kept if any internal checkbox uses it)
  const handleFacetChange = (
    facetName: string,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const next = new Set(selectedFacets[facetName] ?? new Set<string>());
    if (e.target.checked) next.add(e.target.name);
    else next.delete(e.target.name);

    const newSelected = { ...selectedFacets, [facetName]: next };
    setSelectedFacets(newSelected);
    serializeClientState(searchTerm, newSelected);
    updateSearchResults(searchTerm, newSelected);
  };

  // Dropdown chips provide a whole Set at once
  const handleFacetSetChange = (facetName: string, nextValues: Set<string>) => {
    const newSelected = { ...selectedFacets, [facetName]: nextValues.size ? nextValues : new Set<string>() };
    setSelectedFacets(newSelected);
    serializeClientState(searchTerm, newSelected);
    updateSearchResults(searchTerm, newSelected);
  };

  const handleClearAll = () => {
    const cleared: Record<string, Set<string>> = {};
    allowedFacetSet.forEach(k => (cleared[k] = new Set()));
    setSelectedFacets(cleared);
    serializeClientState(searchTerm, cleared);
    updateSearchResults(searchTerm, cleared);
  };

  /** ---------- Render ---------- */

  return (
    <Section>
      <Box sx={{ display: 'grid', gap: 3 }}>
        <FilterBar
          facets={facets}
          selectedFacets={selectedFacets}
          onFacetSetChange={handleFacetSetChange}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          onClearAll={handleClearAll}
        />

        {/* Results list */}
        <ActivityCollection activities={results} />
      </Box>
    </Section>
  );
};

export default ActivityCatalog;
