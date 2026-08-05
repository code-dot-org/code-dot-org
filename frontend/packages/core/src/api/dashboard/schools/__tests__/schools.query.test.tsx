// @vitest-environment jsdom
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {renderHook, waitFor} from '@testing-library/react';
import React from 'react';
import {describe, expect, it, vi} from 'vitest';

import type {ApiClient} from '../../../client/createApiClient';
import {schoolsKeys} from '../schools.keys';
import {useSchoolZipSearch} from '../schools.query';

function renderZipSearch(zip: string) {
  const zipSearch = vi
    .fn()
    .mockResolvedValue([{ncesId: 12345678, name: 'Cavendish High'}]);
  const api = {schools: {zipSearch}} as unknown as ApiClient;
  const client = new QueryClient({
    defaultOptions: {queries: {retry: false}},
  });
  const wrapper = ({children}: {children: React.ReactNode}) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return {
    ...renderHook(() => useSchoolZipSearch(api, zip), {wrapper}),
    zipSearch,
  };
}

describe('useSchoolZipSearch', () => {
  it('searches once the zip is five digits', async () => {
    const {result, zipSearch} = renderZipSearch('98101');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(zipSearch).toHaveBeenCalledWith({zip: '98101'});
    expect(result.current.data).toEqual([
      {ncesId: 12345678, name: 'Cavendish High'},
    ]);
  });

  it('does not search a partial zip', () => {
    const {result, zipSearch} = renderZipSearch('981');

    expect(result.current.fetchStatus).toBe('idle');
    expect(zipSearch).not.toHaveBeenCalled();
  });

  it('does not search a non-numeric zip', () => {
    const {zipSearch} = renderZipSearch('9810a');

    expect(zipSearch).not.toHaveBeenCalled();
  });
});

describe('schoolsKeys', () => {
  it('keys the zip search per zip', () => {
    expect(schoolsKeys.zipSearch('98101')).toEqual([
      'schools',
      'zipSearch',
      '98101',
    ]);
    expect(schoolsKeys.zipSearch('98101')).not.toEqual(
      schoolsKeys.zipSearch('02138'),
    );
  });
});
