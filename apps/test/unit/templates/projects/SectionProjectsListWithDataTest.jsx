import {render, screen} from '@testing-library/react';
import React from 'react';

import {UnconnectedSectionProjectsListWithData as SectionProjectsListWithData} from '@cdo/apps/templates/projects/SectionProjectsListWithData';
import i18n from '@cdo/locale';

const PROJECT = {
  channel: 'ABCDEFGHIJKLM01234',
  name: 'Antelope Freeway',
  studentName: 'Alice',
  type: 'weblab',
  updatedAt: '2016-12-29T11:00:00-00:00',
};

describe('SectionProjectsListWithData', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  function renderWithResponse(deferred) {
    jest.spyOn($, 'ajax').mockReturnValue(deferred.promise());
    render(
      <SectionProjectsListWithData
        sectionId={7}
        studioUrlPrefix="//studio.code.org"
      />
    );
  }

  it('lists the projects when the request succeeds', () => {
    renderWithResponse($.Deferred().resolve([PROJECT]));

    expect(screen.getByText(PROJECT.name)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows an error when the request fails', () => {
    renderWithResponse($.Deferred().reject());

    expect(screen.getByRole('alert')).toHaveTextContent(
      i18n.sectionProjectsLoadError()
    );
    expect(screen.queryByText(PROJECT.name)).not.toBeInTheDocument();
  });
});
