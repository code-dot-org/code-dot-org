import {act, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import $ from 'jquery';
import React from 'react';

import Pairing from '@cdo/apps/code-studio/components/pairing/Pairing.jsx';
import i18n from '@cdo/locale';

describe('Pairing component', () => {
  function setupAjaxMock() {
    const requests = [];
    const ajaxSpy = jest.spyOn($, 'ajax').mockImplementation(options => {
      const deferred = $.Deferred();
      requests.push({options, deferred});
      return deferred;
    });
    return {ajaxSpy, requests};
  }

  function methodForRequest(request) {
    return (
      request.options.method ||
      request.options.type ||
      'GET'
    ).toUpperCase();
  }

  function findMostRecentRequest(requests, {url, method}) {
    for (let i = requests.length - 1; i >= 0; i--) {
      const request = requests[i];
      const methodMatches = methodForRequest(request) === method.toUpperCase();
      const urlMatches = request.options.url === url;
      if (methodMatches && urlMatches) {
        return request;
      }
    }
    throw new Error(`No request found for ${method} ${url}`);
  }

  async function resolveRequest(request, response) {
    await act(async () => {
      request.deferred.resolve(response);
      await Promise.resolve();
    });
  }

  async function rejectRequest(request, error = {}) {
    await act(async () => {
      request.deferred.reject(error);
      await Promise.resolve();
    });
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('before ajax response is received', () => {
    it('does not render a section dropdown', () => {
      const {requests} = setupAjaxMock();
      render(<Pairing />);

      expect(requests).toHaveLength(1);
      expect(methodForRequest(requests[0])).toBe('GET');
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });
  });

  describe('handles http errors', () => {
    it('shows an error when the initial GET request fails', async () => {
      const {requests} = setupAjaxMock();
      render(<Pairing source="/pairings" />);

      const getRequest = findMostRecentRequest(requests, {
        method: 'GET',
        url: '/pairings',
      });
      await rejectRequest(getRequest);

      expect(
        await screen.findByText(i18n.unexpectedError())
      ).toBeInTheDocument();
    });
  });

  describe('for student in multiple sections', () => {
    const ajaxState = {
      sections: [
        {
          id: 1,
          name: 'A section',
          students: [
            {id: 11, name: 'First student'},
            {id: 12, name: 'Second Student'},
          ],
        },
        {id: 15, name: 'Another section'},
      ],
      pairings: [],
    };

    it('changes selected section and updates visible students', async () => {
      const user = userEvent.setup();
      const {requests} = setupAjaxMock();
      render(<Pairing source="/pairings" />);

      const getRequest = findMostRecentRequest(requests, {
        method: 'GET',
        url: '/pairings',
      });
      await resolveRequest(getRequest, ajaxState);

      const sectionSelect = await screen.findByRole('combobox');
      await user.selectOptions(sectionSelect, '1');
      expect(
        screen.getByRole('button', {name: 'First student'})
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: 'Second Student'})
      ).toBeInTheDocument();

      await user.selectOptions(sectionSelect, '15');
      await waitFor(() => {
        expect(
          screen.queryByRole('button', {name: 'First student'})
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('for student in one section', () => {
    const ajaxState = {
      sections: [
        {
          id: 1,
          name: 'A section',
          students: [
            {id: 11, name: 'First student'},
            {id: 12, name: 'Second Student'},
          ],
        },
      ],
      pairings: [],
    };

    it('shows and hides Add Partners as student selections change', async () => {
      const user = userEvent.setup();
      const {requests} = setupAjaxMock();
      render(<Pairing source="/pairings" />);

      const getRequest = findMostRecentRequest(requests, {
        method: 'GET',
        url: '/pairings',
      });
      await resolveRequest(getRequest, ajaxState);

      const firstStudentButton = await screen.findByRole('button', {
        name: 'First student',
      });
      const addPartnersButtonName = i18n.addPartners();

      expect(
        screen.queryByRole('button', {name: addPartnersButtonName})
      ).not.toBeInTheDocument();

      await user.click(firstStudentButton);
      expect(
        screen.getByRole('button', {name: addPartnersButtonName})
      ).toBeInTheDocument();

      await user.click(firstStudentButton);
      expect(
        screen.queryByRole('button', {name: addPartnersButtonName})
      ).not.toBeInTheDocument();
    });

    it('submits selected partners with expected payload', async () => {
      const user = userEvent.setup();
      const {requests} = setupAjaxMock();
      render(<Pairing source="/pairings" />);

      const getRequest = findMostRecentRequest(requests, {
        method: 'GET',
        url: '/pairings',
      });
      await resolveRequest(getRequest, ajaxState);

      await user.click(
        await screen.findByRole('button', {name: 'First student'})
      );
      await user.click(screen.getByRole('button', {name: i18n.addPartners()}));

      const putRequest = findMostRecentRequest(requests, {
        method: 'PUT',
        url: '/pairings',
      });
      expect(putRequest.options.data).toBe(
        '{"pairings":[{"id":11,"name":"First student"}],"sectionId":1}'
      );
    });

    it('shows an error if adding partners fails', async () => {
      const user = userEvent.setup();
      const {requests} = setupAjaxMock();
      render(<Pairing source="/pairings" />);

      const getRequest = findMostRecentRequest(requests, {
        method: 'GET',
        url: '/pairings',
      });
      await resolveRequest(getRequest, ajaxState);

      await user.click(
        await screen.findByRole('button', {name: 'First student'})
      );
      await user.click(screen.getByRole('button', {name: i18n.addPartners()}));

      const putRequest = findMostRecentRequest(requests, {
        method: 'PUT',
        url: '/pairings',
      });
      await rejectRequest(putRequest);

      expect(
        await screen.findByText(i18n.unexpectedError())
      ).toBeInTheDocument();
    });
  });

  describe('for student who is currently pairing', () => {
    const ajaxState = {
      sections: [
        {
          id: 1,
          name: 'A section',
          students: [
            {id: 11, name: 'First student'},
            {id: 12, name: 'Second Student'},
          ],
        },
        {
          id: 56,
          name: 'Another section',
        },
      ],
      pairings: [
        {id: 546, name: 'Josh'},
        {id: 563, name: 'Charing'},
        {id: 96747, name: 'Andrew O.'},
      ],
    };

    it('returns to selection mode when Stop succeeds', async () => {
      const user = userEvent.setup();
      const {requests} = setupAjaxMock();
      render(<Pairing source="/pairings" />);

      const getRequest = findMostRecentRequest(requests, {
        method: 'GET',
        url: '/pairings',
      });
      await resolveRequest(getRequest, ajaxState);

      await user.click(
        await screen.findByRole('button', {name: i18n.pairProgrammingStop()})
      );
      const putRequest = findMostRecentRequest(requests, {
        method: 'PUT',
        url: '/pairings',
      });
      expect(putRequest.options.data).toBe('{"pairings":[]}');
      await resolveRequest(putRequest, {sections: [], pairings: []});

      expect(await screen.findByRole('combobox')).toBeInTheDocument();
      expect(screen.queryByText('Josh')).not.toBeInTheDocument();
    });

    it('shows an error when Stop fails', async () => {
      const user = userEvent.setup();
      const {requests} = setupAjaxMock();
      render(<Pairing source="/pairings" />);

      const getRequest = findMostRecentRequest(requests, {
        method: 'GET',
        url: '/pairings',
      });
      await resolveRequest(getRequest, ajaxState);

      await user.click(
        await screen.findByRole('button', {name: i18n.pairProgrammingStop()})
      );
      const putRequest = findMostRecentRequest(requests, {
        method: 'PUT',
        url: '/pairings',
      });
      await rejectRequest(putRequest);

      expect(
        await screen.findByText(i18n.unexpectedError())
      ).toBeInTheDocument();
    });
  });
});
