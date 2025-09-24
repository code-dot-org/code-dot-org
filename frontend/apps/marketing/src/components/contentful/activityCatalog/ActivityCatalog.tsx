'use client';
import {Box} from '@mui/material';
import {FacetResult, InternalTypedDocument, Orama, search} from '@orama/orama';
import {restore} from '@orama/plugin-data-persistence';
import {useRouter, useSearchParams} from 'next/navigation';
import {useEffect, useMemo, useRef, useState} from 'react';

import FilterBar from '@/components/contentful/ActivityCatalog/FilterBar/FilterBar';
import Section from '@/components/contentful/section';
import ActivityCollection from '@/components/csforall/activityCollection/ActivityCollection';
import {ActivitySchema} from '@/modules/activityCatalog/orama/schema/ActivitySchema';
import {Activity} from '@/modules/activityCatalog/types/Activity';

interface ActivityCatalogProps {
  serializedOramaDb: string | ArrayBuffer | Buffer<ArrayBufferLike>;
  activities: InternalTypedDocument<Activity>[];
  facets: FacetResult | undefined;
}

const ActivityCatalog = ({
  serializedOramaDb,
  activities,
  facets,
}: ActivityCatalogProps) => {
  const allowedFacetSet = useMemo(
    () => new Set(facets ? Object.keys(facets) : []),
    [facets],
  );

  const [results, setResults] =
    useState<InternalTypedDocument<Activity>[]>(activities);
  const [db, setDb] = useState<Orama<typeof ActivitySchema> | undefined>(
    undefined,
  );
  const [selectedFacets, setSelectedFacets] = useState<
    Record<string, Set<string>>
  >({});
  const [searchTerm, setSearchTerm] = useState<string>('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const skipNextUrlSyncRef = useRef(false);

  useEffect(() => {
    restore<Orama<typeof ActivitySchema>>('json', serializedOramaDb).then(
      restoredDb => {
        setDb(restoredDb);
        hydrateFromUrl();
        skipNextUrlSyncRef.current = true;
      },
    );
  }, []);

  useEffect(() => {
    if (db) {
      hydrateFromUrl();
      skipNextUrlSyncRef.current = true;
    }
  }, [db, searchParams]);

  const buildQueryFromState = (
    term: string,
    _selected: Record<string, Set<string>>,
  ) => {
    const params = new URLSearchParams();
    Object.entries(_selected).forEach(([facet, values]) => {
      if (values && values.size > 0) {
        const encoded = Array.from(values).map(v => encodeURIComponent(v));
        params.set(facet, encoded.join(','));
      }
    });
    const t = encodeURIComponent(term);
    const qs = params.toString();
    return qs ? `?term=${t}&${qs}` : `?term=${t}`;
  };

  const hydrateFromUrl = () => {
    const termFromUrl = searchParams.get('term') || '';
    setSearchTerm(termFromUrl);

    const params = new URLSearchParams(searchParams.toString());
    const restored: Record<string, Set<string>> = {};
    params.forEach((value, key) => {
      if (!allowedFacetSet.has(key)) return;
      const decoded = value
        .split(',')
        .map(v => decodeURIComponent(v))
        .filter(Boolean);
      restored[key] = new Set(decoded);
    });

    allowedFacetSet.forEach(k => {
      if (!restored[k]) restored[k] = new Set();
    });

    setSelectedFacets(restored);
  };

  useEffect(() => {
    if (!db) return;

    // Run search
    (async () => {
      const where = Object.entries(selectedFacets).reduce(
        (acc, [k, set]) => {
          if (set && set.size > 0) acc[k] = Array.from(set);
          return acc;
        },
        Object.create(null) as Record<string, string[]>,
      );

      const res = await search(db, {
        term: searchTerm,
        properties: ['title', 'languagesText'],
        where,
      });
      setResults(res.hits.map(h => h.document));
    })();

    // Sync URL (skip when we just hydrated from URL)
    if (skipNextUrlSyncRef.current) {
      skipNextUrlSyncRef.current = false;
      return;
    }
    const nextHref = buildQueryFromState(searchTerm, selectedFacets);
    // Use replace to avoid spamming history; do NOT call in render.
    router.replace(nextHref, {scroll: false});
  }, [db, searchTerm, selectedFacets]);

  /** Handlers (no router navigation here) */
  const onSearchChange = (v: string) => {
    setSearchTerm(v);
  };

  const handleFacetSetChange = (facetName: string, nextValues: Set<string>) => {
    setSelectedFacets(prev => {
      const updated = {
        ...prev,
        [facetName]: nextValues.size ? nextValues : new Set<string>(),
      };
      return updated; // URL + search are handled by the effect above
    });
  };

  const handleClearAll = () => {
    setSelectedFacets(() => {
      const cleared: Record<string, Set<string>> = {};
      allowedFacetSet.forEach(k => (cleared[k] = new Set()));
      return cleared;
    });
  };

  return (
    <Section>
      <Box sx={{display: 'grid', gap: 3}}>
        <FilterBar
          facets={facets}
          selectedFacets={selectedFacets}
          onFacetSetChange={handleFacetSetChange}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          onClearAll={handleClearAll}
        />
        <ActivityCollection activities={results} />
      </Box>
    </Section>
  );
};

export default ActivityCatalog;
