import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';
import {Provider} from 'react-redux';
import {Store} from 'redux';

import {getStore} from '@cdo/apps/redux';
import {ArchiveAllModal} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/ArchiveAllModal';
import HttpClient from '@cdo/apps/util/HttpClient';

describe('ArchiveAllModal', () => {
  const fetchSpy = jest.spyOn(HttpClient, 'post');

  let store: Store;

  beforeEach(() => {
    store = getStore();
    fetchSpy.mockResolvedValue(new Response(JSON.stringify({num_hidden: 2})));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const defaultProps = {
    onClose: () => {},
  };

  function renderDefault(propOverrides = {}) {
    render(
      <Provider store={store}>
        <ArchiveAllModal {...defaultProps} {...propOverrides} />
      </Provider>
    );
  }

  it('should display the correct modal', () => {
    renderDefault();
    screen.getByText('Archive all class sections?');
    screen.getByText('Note: this will', {exact: false});
    screen.getByRole('button', {name: 'Archive all class sections'});
    screen.getByRole('button', {name: 'Cancel'});
  });

  it('should call the archive function when the archive all button is clicked', async () => {
    renderDefault();
    const archiveButton = screen.getByRole('button', {
      name: 'Archive all class sections',
    });
    fireEvent.click(archiveButton);
    expect(fetchSpy).toHaveBeenCalledWith('/sections/archive_all');
  });

  it('should display the number of hidden sections after archiving', async () => {
    renderDefault();
    const archiveButton = screen.getByRole('button', {
      name: 'Archive all class sections',
    });
    fireEvent.click(archiveButton);

    await screen.findByText('2 sections were archived.');
    screen.getByRole('button', {name: 'Close'});
  });

  it('should close the modal when the close button is clicked', async () => {
    const onClose = jest.fn();
    renderDefault({onClose});
    const archiveButton = screen.getByRole('button', {
      name: 'Archive all class sections',
    });
    fireEvent.click(archiveButton);

    const closeButton = await screen.findByRole('button', {name: 'Close'});
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('should close the modal when the cancel button is clicked', async () => {
    const onClose = jest.fn();
    renderDefault({onClose});
    const cancelButton = screen.getByRole('button', {name: 'Cancel'});
    fireEvent.click(cancelButton);
    expect(onClose).toHaveBeenCalled();
  });
});
