import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import EditPanelsLinks from '@cdo/apps/lab2/levelEditors/panels/EditPanelsLinks';
import {
  DEFAULT_PANEL_LINK_X,
  DEFAULT_PANEL_LINK_Y,
  Panel,
} from '@cdo/apps/panels/types';

describe('EditPanelsLinks', () => {
  const panel: Panel = {
    key: 'panel-1',
    imageUrl: 'background.png',
    text: '',
  };

  const targetPanel: Panel = {
    ...panel,
    key: 'panel-2',
  };

  it('adds text without a target panel', () => {
    const updatePanel = jest.fn();
    render(
      <EditPanelsLinks
        panel={panel}
        allPanels={[panel]}
        updatePanel={updatePanel}
      />
    );

    fireEvent.click(screen.getByRole('button', {name: /Add Text/}));

    expect(updatePanel).toHaveBeenCalledWith({
      ...panel,
      links: [
        {
          text: '',
          x: DEFAULT_PANEL_LINK_X,
          y: DEFAULT_PANEL_LINK_Y,
        },
      ],
    });
  });

  it('updates and removes a text target panel', () => {
    const updatePanel = jest.fn();
    const panelWithText: Panel = {
      ...panel,
      links: [{text: 'Panel text', x: 10, y: 20}],
    };
    render(
      <EditPanelsLinks
        panel={panelWithText}
        allPanels={[panelWithText, targetPanel]}
        updatePanel={updatePanel}
      />
    );

    fireEvent.change(screen.getByLabelText('Target panel'), {
      target: {value: 'panel-2'},
    });

    expect(updatePanel).toHaveBeenLastCalledWith({
      ...panelWithText,
      links: [{text: 'Panel text', x: 10, y: 20, targetKey: 'panel-2'}],
    });

    fireEvent.change(screen.getByLabelText('Target panel'), {
      target: {value: ''},
    });

    expect(updatePanel).toHaveBeenLastCalledWith({
      ...panelWithText,
      links: [{text: 'Panel text', x: 10, y: 20}],
    });
  });

  it('deletes text', () => {
    const updatePanel = jest.fn();
    const panelWithText: Panel = {
      ...panel,
      links: [{text: 'Panel text', x: 10, y: 20}],
    };
    render(
      <EditPanelsLinks
        panel={panelWithText}
        allPanels={[panelWithText, targetPanel]}
        updatePanel={updatePanel}
      />
    );

    fireEvent.click(screen.getByRole('button', {name: 'Delete text'}));

    expect(updatePanel).toHaveBeenCalledWith({
      ...panelWithText,
      links: undefined,
    });
  });
});
