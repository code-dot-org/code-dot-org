/* eslint no-unused-vars: "error" */
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {
  ImportScreensDialog,
  ScreenListItem,
  AssetListItem,
  IMPORT_FAILURE_MESSAGE,
} from '@cdo/apps/applab/ImportScreensDialog';
import AssetThumbnail from '@cdo/apps/code-studio/components/AssetThumbnail';

describe('AssetListItem', () => {
  var item;

  it('Will only show the filename when it is not replacing an existing asset', () => {
    item = shallow(
      <AssetListItem
        asset={{filename: 'bar.mp3', category: 'audio', willReplace: false}}
      />
    );
    expect(
      item.matchesElement(
        <div>
          <AssetThumbnail type="audio" name="bar.mp3" />
          <div>bar.mp3</div>
        </div>
      )
    ).toBe(true);
  });

  it('will show a warning when replacing an existing asset', () => {
    item = shallow(
      <AssetListItem
        asset={{filename: 'bar.mp3', category: 'audio', willReplace: true}}
      />
    );
    expect(item.text()).toContain(
      'Warning: Importing this will replace your existing "bar.mp3".'
    );
  });

  it('uses the current project id when no other id is specified', () => {
    const itemWithoutProjectId = mount(
      <AssetListItem
        asset={{filename: 'bar.png', category: 'image', willReplace: false}}
      />
    );
    expect(itemWithoutProjectId.find('img').prop('src')).toContain(
      '/v3/assets/undefined/bar.png'
    );
  });

  it("uses the specified project's id", () => {
    const itemWithProjectId = mount(
      <AssetListItem
        projectId="1234"
        asset={{filename: 'bar.png', category: 'image', willReplace: false}}
      />
    );
    expect(itemWithProjectId.find('img').prop('src')).toContain(
      '/v3/assets/1234/bar.png'
    );
  });
});

describe('ScreenListItem', () => {
  var item;

  it("Will only show the screen's id when it is not replacing an existing screen", () => {
    item = shallow(
      <ScreenListItem
        screen={{
          id: 'main_screen',
          willReplace: false,
          assetsToImport: [],
          assetsToReplace: [],
          canBeImported: true,
          conflictingIds: [],
          html: '',
        }}
      />
    );
    expect(item.text()).toContain('main_screen');
  });

  it('Will show a warning when replacing another screen', () => {
    item = shallow(
      <ScreenListItem
        screen={{
          id: 'main_screen',
          willReplace: true,
          assetsToImport: [],
          assetsToReplace: [],
          canBeImported: true,
          conflictingIds: [],
          html: '',
        }}
      />
    );
    expect(item.text()).toContain('main_screen');
    expect(item.text()).toContain(
      'Importing this will replace your existing screen: "main_screen".'
    );
  });

  it('Will show a warning when replacing another screen with assets', () => {
    item = shallow(
      <ScreenListItem
        screen={{
          id: 'main_screen',
          willReplace: true,
          assetsToImport: [],
          assetsToReplace: ['foo.png', 'bar.png'],
          canBeImported: true,
          conflictingIds: [],
          html: '',
        }}
      />
    );
    expect(item.text()).toContain('main_screen');
    expect(item.text()).toContain(
      'Importing this will replace your existing screen: "main_screen".'
    );
    expect(item.text()).toContain(
      'Importing this will replace your existing assets: "foo.png", "bar.png".'
    );
  });

  it('Will show the list of conflicting Ids if there are any', () => {
    item = shallow(
      <ScreenListItem
        screen={{
          id: 'main_screen',
          willReplace: true,
          assetsToImport: [],
          assetsToReplace: ['foo.png', 'bar.png'],
          canBeImported: false,
          conflictingIds: ['input1', 'input2'],
          html: '',
        }}
      />
    );
    expect(item.text()).toContain('main_screen');
    expect(item.text()).toContain(
      'Uses existing element or screen IDs: "input1", "input2".'
    );
    // we don't want to show other errors related to importing.
    expect(item.text()).not.toContain(
      'Importing this will replace your existing assets'
    );
    expect(item.text()).not.toContain(
      'Importing this will replace your existing screen'
    );
  });
});

describe('ImportScreensDialog', () => {
  const exampleHtml = `
    <div>
      <div class="screen" id="screen1">
        <img src="https://code.org/images/fit-320/avatars/hadi_partovi.jpg"
             data-canonical-image-url="asset1.png"
             id="img2">
      </div>
    </div>`;

  const screenFixture = overrides => ({
    id: 'main_screen',
    willReplace: false,
    assetsToImport: [],
    assetsToReplace: [],
    canBeImported: true,
    conflictingIds: [],
    html: exampleHtml,
    ...overrides,
  });

  let onImport, handleClose;

  function renderDialog(project, props) {
    onImport = jest.fn();
    handleClose = jest.fn();
    render(
      <ImportScreensDialog
        onImport={onImport}
        handleClose={handleClose}
        project={{id: 'some-project', name: 'Some Project', ...project}}
        {...props}
      />
    );
  }

  // MultiCheckboxSelector names each item's checkbox after the screen id or
  // asset filename it selects.
  function checkboxFor(name) {
    return screen.getByRole('checkbox', {name});
  }

  describe('When given a list of screens', () => {
    beforeEach(() => {
      renderDialog({screens: [screenFixture()], otherAssets: []});
    });

    it('renders a dialog with the list of screens', () => {
      expect(
        screen.getByRole('heading', {
          name: /Import from Project: Some Project/,
        })
      ).toBeDefined();
      expect(screen.getByRole('heading', {name: 'Screens'})).toBeDefined();
      expect(screen.getByText('main_screen')).toBeDefined();
    });

    it('renders an Import button which calls onImport when clicked', async () => {
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', {name: 'Import'}));

      expect(onImport).toHaveBeenCalledWith('some-project', [], []);
    });

    it('passes the selected screens to the onImport prop function', async () => {
      const user = userEvent.setup();

      await user.click(checkboxFor('main_screen'));
      await user.click(screen.getByRole('button', {name: 'Import'}));

      expect(onImport).toHaveBeenCalledWith(
        'some-project',
        [expect.objectContaining({id: 'main_screen'})],
        []
      );
    });

    it('should have no selected screens initially', () => {
      expect(checkboxFor('main_screen').checked).toBe(false);
    });

    it('should keep track of the selected screens when they are changed', async () => {
      const user = userEvent.setup();

      await user.click(checkboxFor('main_screen'));

      expect(checkboxFor('main_screen').checked).toBe(true);
    });
  });

  describe('When given other assets that can be imported', () => {
    beforeEach(() => {
      renderDialog({
        screens: [],
        otherAssets: [
          {filename: 'foo.png', category: 'image', willReplace: false},
          {filename: 'bar.mov', category: 'video', willReplace: true},
        ],
      });
    });

    it('should have an Other Assets header', () => {
      expect(screen.getByRole('heading', {name: 'Other Assets'})).toBeDefined();
    });

    it('should have no selected assets initially', () => {
      expect(checkboxFor('foo.png').checked).toBe(false);
      expect(checkboxFor('bar.mov').checked).toBe(false);
    });

    it('the import button passes the selected assets to the onImport prop function', async () => {
      const user = userEvent.setup();

      await user.click(checkboxFor('foo.png'));
      await user.click(screen.getByRole('button', {name: 'Import'}));

      expect(onImport).toHaveBeenCalledWith(
        'some-project',
        [],
        [expect.objectContaining({filename: 'foo.png'})]
      );
    });

    it('should keep track of the selected assets when they are changed', async () => {
      const user = userEvent.setup();

      await user.click(checkboxFor('foo.png'));

      expect(checkboxFor('foo.png').checked).toBe(true);
      expect(checkboxFor('bar.mov').checked).toBe(false);
    });
  });

  describe('When given screens that cannot be imported', () => {
    beforeEach(() => {
      renderDialog({
        screens: [
          screenFixture({canBeImported: false, conflictingIds: ['img2']}),
        ],
        otherAssets: [],
      });
    });

    it("renders a 'Cannot Import' section", () => {
      const heading = screen.getByRole('heading', {name: 'Cannot Import'});

      expect(heading).toBeDefined();
      // getByText matches against whitespace-collapsed DOM text, so collapse
      // the message's own indentation and newlines before comparing.
      expect(
        screen.getByText(IMPORT_FAILURE_MESSAGE.trim().replace(/\s+/g, ' '))
      ).toBeDefined();
      expect(screen.getAllByRole('listitem')).toHaveLength(1);
      expect(screen.getByText('main_screen')).toBeDefined();
      // Nothing here can be selected, so there is no checkbox to select it.
      expect(screen.queryByRole('checkbox')).toBeNull();
    });

    it('offers only a Cancel button, which closes the dialog', async () => {
      const user = userEvent.setup();

      expect(screen.queryByRole('button', {name: 'Import'})).toBeNull();
      await user.click(screen.getByRole('button', {name: 'Cancel'}));

      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('When importing', () => {
    beforeEach(() => {
      renderDialog(
        {screens: [screenFixture()], otherAssets: []},
        {isImporting: true}
      );
    });

    it('should disable the confirmation button', () => {
      expect(screen.getByRole('button', {name: 'Import'}).disabled).toBe(true);
    });

    it('should disable the multi checkbox widget', () => {
      screen
        .getAllByRole('checkbox')
        .forEach(checkbox => expect(checkbox.disabled).toBe(true));
    });
  });
});
