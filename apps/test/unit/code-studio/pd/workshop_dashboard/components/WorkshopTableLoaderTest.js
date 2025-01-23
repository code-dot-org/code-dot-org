import {render, screen, waitFor} from '@testing-library/react';
import React from 'react';

import WorkshopTableLoader from '@cdo/apps/code-studio/pd/workshop_dashboard/components/WorkshopTableLoader';

describe('WorkshopTableLoader', () => {
  const getFakeWorkshopsData = () => {
    return [{id: 1}, {id: 2}];
  };

  it('Initially displays a spinner', () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockImplementation(() => new Promise(() => {}));

    const Child = jest.fn().mockImplementation(() => null);
    render(
      <WorkshopTableLoader queryUrl="fake-query-url">
        <Child />
      </WorkshopTableLoader>
    );

    screen.findByTitle('Loading...');

    fetchMock.mockRestore();
  });

  it('Loads workshops using fetch and passes them to the child component', async () => {
    const fakeWorkshopsData = getFakeWorkshopsData();

    const responseData = {
      workshops: fakeWorkshopsData,
      length: fakeWorkshopsData.length,
      total_count: fakeWorkshopsData.length,
    };

    const fetchMock = jest.spyOn(global, 'fetch').mockImplementation(() => {
      return Promise.resolve({
        json: () => Promise.resolve(responseData),
        ok: true,
      });
    });

    const Child = jest.fn().mockImplementation(() => null);

    render(
      <WorkshopTableLoader queryUrl="fake-query-url">
        <Child />
      </WorkshopTableLoader>
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);

      expect(Child).toHaveBeenCalledTimes(1);
      expect(Child.mock.calls[0][0].workshops).toEqual(responseData);
      expect(Child.mock.calls[0][0].onDelete).toBeNull();
    });

    fetchMock.mockRestore();
  });

  it('Applies queryParams to the queryURL', async () => {
    const Child = jest.fn().mockImplementation(() => null);

    const responseData = {
      workshops: [],
      length: 0,
      total_count: 0,
    };

    const fetchMock = jest.spyOn(global, 'fetch').mockImplementation(() => {
      return Promise.resolve({
        json: () => Promise.resolve(responseData),
        ok: true,
      });
    });

    render(
      <WorkshopTableLoader
        queryUrl="https://studio.code.org/api/v1/pd/workshops/filter"
        queryParams={{
          date_order: 'desc',
          state: 'In Progress',
          empty: null, // Empty params are filtered out / not added to the url
        }}
      >
        <Child />
      </WorkshopTableLoader>
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://studio.code.org/api/v1/pd/workshops/filter?date_order=desc&state=In+Progress',
        {headers: {'Content-Type': 'application/json'}, method: 'GET'}
      );
    });

    fetchMock.mockRestore();
  });

  it('Passes delete function to child when canDelete is true', async () => {
    const fakeWorkshopsData = getFakeWorkshopsData();
    const responseData = {
      workshops: fakeWorkshopsData,
      length: fakeWorkshopsData.length,
      total_count: fakeWorkshopsData.length,
    };

    const fetchMock = jest.spyOn(global, 'fetch').mockImplementation(() => {
      return Promise.resolve({
        json: () => Promise.resolve(responseData),
        ok: true,
      });
    });

    const Child = jest.fn().mockImplementation(() => null);

    render(
      <WorkshopTableLoader queryUrl="fake-query-url" canDelete>
        <Child />
      </WorkshopTableLoader>
    );

    await waitFor(() => {
      expect(Child).toHaveBeenCalledTimes(1);
      expect(Child.mock.calls[0][0].workshops).toEqual(responseData);
      expect(Child.mock.calls[0][0].onDelete).toBeDefined();
    });

    fetchMock.mockRestore();
  });

  it('Displays no workshops found message when no workshops are found', async () => {
    const responseData = {
      workshops: [],
      length: 0,
      total_count: 0,
    };

    const fetchMock = jest.spyOn(global, 'fetch').mockImplementation(() => {
      return Promise.resolve({
        json: () => Promise.resolve(responseData),
        ok: true,
      });
    });

    const Child = jest.fn().mockImplementation(() => null);

    render(
      <WorkshopTableLoader queryUrl="fake-query-url">
        <Child />
      </WorkshopTableLoader>
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
      screen.findByText('No workshops found');
    });
    expect(Child).toHaveBeenCalledTimes(0);

    fetchMock.mockRestore();
  });

  it('Renders null when hideNoWorkshopsMessage is specified and no workshops are found', async () => {
    const responseData = {
      workshops: [],
      length: 0,
      total_count: 0,
    };
    const fetchMock = jest.spyOn(global, 'fetch').mockImplementation(() => {
      return Promise.resolve({
        json: () => Promise.resolve(responseData),
        ok: true,
      });
    });

    const Child = jest.fn().mockImplementation(() => null);

    render(
      <WorkshopTableLoader queryUrl="fake-query-url" hideNoWorkshopsMessage>
        <Child />
      </WorkshopTableLoader>
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    expect(screen.queryByText('No workshops found')).toBeNull();
    expect(Child).toHaveBeenCalledTimes(0);

    fetchMock.mockRestore();
  });
});
