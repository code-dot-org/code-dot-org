'use client';
import Input from '@mui/material/Input';
import {FacetResult, InternalTypedDocument, Orama, search} from '@orama/orama';
import {restore} from '@orama/plugin-data-persistence';
import {useRouter, useSearchParams} from 'next/navigation';
import {ChangeEvent, useEffect, useState} from 'react';

import FacetPanel from '@/components/contentful/activityCatalog/facetPanel/FacetPanel';
import Section from '@/components/contentful/section';
import ActivityCollection from '@/components/csforall/activityCollection/ActivityCollection';
import {ActivitySchema} from '@/modules/activityCatalog/orama/schema/ActivitySchema';
import {Activity} from '@/modules/activityCatalog/types/Activity';

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
  const allowedFacetSet = new Set(facets ? Object.keys(facets) : []);

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

  // On load, restore the Orama database from the serialized data from the server on the browser.
  useEffect(() => {
    restore<Orama<typeof ActivitySchema>>('json', serializedOramaDb).then(
      restoredDb => {
        setDb(restoredDb);
        deserializeClientState();
      },
    );
  }, []);

  // Populate selected facets and search term from the URL search params on load and when they change.
  useEffect(() => {
    // The database may not be loaded yet, only hydrate when it is.
    if (db) {
      deserializeClientState();
    }
  }, [db, searchParams]);

  /**
   * Hydrates the client state (search term and selected facets) from the URL search params.
   * This allows for sharing links with specific search terms and facets selected.
   */
  const deserializeClientState = () => {
    // Restore the search term
    const termFromSearchParam = searchParams.get('term') || '';
    setSearchTerm(termFromSearchParam);

    // Restore selected facets
    const facetsFromUrl = deserializeSelectedFacets(searchParams.toString());
    setSelectedFacets(facetsFromUrl);

    // Restore the search results based on the restored state
    updateSearchResults(termFromSearchParam, facetsFromUrl);
  };

  /**
   * Serializes the client state (search term and selected facets) to the URL search params.
   * This allows for sharing links with specific search terms and facets selected.
   * @param searchTerm - The current search term to serialize.
   * @param selectedFacets - The currently selected facets to serialize.
   */
  const serializeClientState = (
    searchTerm: string,
    selectedFacets: Record<string, Set<string>>,
  ) => {
    const params = new URLSearchParams();

    /**
     * For each selected facet, add it to the URL search params as a comma-separated list.
     * Each value is individually encoded to handle commas and special characters.
     */
    Object.entries(selectedFacets).forEach(([facet, values]) => {
      if (values.size > 0) {
        // The value may contain commas, so encode each value individually.
        const encodedValues = Array.from(values).map(v =>
          encodeURIComponent(v),
        );
        params.set(facet, encodedValues.join(','));
      }
    });

    router.push(`?term=${encodeURIComponent(searchTerm)}&${params.toString()}`);
  };

  /**
   * Deserializes the selected facets from the URL search params.
   * Each facet value is expected to be a comma-separated list of values.
   * Each value is individually decoded to handle commas and special characters.
   * @param query - The URL query string to deserialize.
   * @returns An object mapping facet names to sets of selected values.
   */
  const deserializeSelectedFacets = (
    query: string,
  ): Record<string, Set<string>> => {
    const params = new URLSearchParams(query);
    const facets: Record<string, Set<string>> = {};

    params.forEach((value, key) => {
      // Exclude non-allowed facets, such as a malicious user adding arbitrary params.
      if (!allowedFacetSet.has(key)) {
        return;
      }

      // Restore each facet value by splitting on commas and decoding each value.
      const decodedValues = value
        .split(',')
        .map(v => decodeURIComponent(v))
        .filter(Boolean);

      facets[key] = new Set(decodedValues);
    });

    return facets;
  };

  const updateSearchResults = async (
    term: string,
    searchFacets: Record<string, Set<string>>,
  ) => {
    if (!db) {
      return;
    }

    /**
     * Convert the selected facets from sets to arrays for Orama query.
     * Example: {ages: Set{'5-7', '8-10'}} becomes {ages: ['5-7', '8-10']}
     */
    const facetFilters = Object.entries(searchFacets).reduce(
      (acc, [facetName, _facetValues]) => {
        const facetValues = _facetValues as Set<string>;
        if (facetValues.size > 0) {
          acc[facetName] = [...facetValues];
        }
        return acc;
      },
      Object.create({}),
    );

    // Perform the search with the current term and selected facets
    const searchResults = await search(db, {
      term,
      properties: ['title'],
      where: {
        ...facetFilters,
      },
    });

    const nextResults = searchResults.hits.map(hit => hit.document);
    setResults(nextResults);
  };

  /**
   * Updates the search term state and triggers a new search when the user types in the search input.
   * @param e - The change event from the search input.
   */
  const handleSearchTermChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextSearchTerm = e.target.value;

    // Update the search term state
    setSearchTerm(nextSearchTerm);

    // Update the URL query parameters
    serializeClientState(nextSearchTerm, selectedFacets);

    // Update the search results based on the new search term
    updateSearchResults(nextSearchTerm, selectedFacets);
  };

  /**
   * Handles changes to facet selections when a user checks or unchecks a facet checkbox.
   * Updates the selected facets state, serializes the new state to the URL, and triggers a new search.
   * @param facetName - The name of the facet being changed.
   * @param e - The change event from the checkbox input.
   */
  const handleFacetChange = (
    facetName: string,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const newSelectedFacets = {...selectedFacets};

    // Initialize the set for this facet if it doesn't exist yet
    // Note: A set is used to avoid duplicate values
    if (!newSelectedFacets[facetName]) {
      newSelectedFacets[facetName] = new Set<string>();
    }

    // Add or remove the facet value based on whether the checkbox is checked or unchecked
    if (e.target.checked) {
      newSelectedFacets[facetName].add(e.target.name);
    } else {
      newSelectedFacets[facetName].delete(e.target.name);
    }

    // Update the selected facets state
    setSelectedFacets(newSelectedFacets);
    // Update the URL query parameters
    serializeClientState(searchTerm, newSelectedFacets);

    // Update the search results based on the new selected facets
    updateSearchResults(searchTerm, newSelectedFacets);
  };

  return (
    <>
      <Section>
        <section style={{display: 'flex', gap: '20px'}}>
          <div>
            <Input
              onChange={handleSearchTermChange}
              value={searchTerm}
              placeholder={'Search...'}
            />

            <FacetPanel
              facets={facets}
              selectedFacets={selectedFacets}
              onFacetChange={handleFacetChange}
            />
          </div>
          <div style={{width: '100%'}}>
            <ActivityCollection activities={results} />
          </div>
        </section>
      </Section>
    </>
  );
};

export default ActivityCatalog;
