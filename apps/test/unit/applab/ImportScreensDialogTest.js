/* eslint no-unused-vars: "error" */
import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {
  ImportScreensDialog,
  ScreenListItem,
  AssetListItem,
  IMPORT_FAILURE_MESSAGE,
} from '@cdo/apps/applab/ImportScreensDialog';
import AssetThumbnail from '@cdo/apps/code-studio/components/AssetThumbnail';
import Dialog, {
  Body,
  Buttons,
  Confirm,
  Cancel,
} from '@cdo/apps/templates/Dialog';

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
  let dialog, onImport;

  function getDialogButton() {
    return dialog.children().at(1).children().at(0);
  }

  describe('When given a list of screens', () => {
    beforeEach(() => {
      const exampleHtml = `
        <div>
          <div class="screen" id="screen1">
            <img src="https://code.org/images/fit-320/avatars/hadi_partovi.jpg"
                 data-canonical-image-url="asset1.png"
                 id="img2">
          </div>
        </div>`;
      onImport = jest.fn();
      dialog = shallow(
        <ImportScreensDialog
          hideBackdrop
          onImport={onImport}
          project={{
            id: 'some-project',
            name: 'Some Project',
            screens: [
              {
                id: 'main_screen',
                willReplace: true,
                assetsToImport: [],
                assetsToReplace: [],
                canBeImported: true,
                conflictingIds: [],
                html: exampleHtml,
              },
            ],
            otherAssets: [],
          }}
        />
      );
    });

    it('renders a dialog with the list of screens', () => {
      expect(dialog.type()).toBe(Dialog);
      expect(dialog.children().at(0).type()).toBe(Body);
      expect(dialog.children().at(1).type()).toBe(Buttons);
      expect(dialog.find('MultiCheckboxSelector').length).toBe(1);
    });

    it('renders an Import button which calls onImport when clicked', () => {
      const button = getDialogButton();
      expect(button.type()).toBe(Confirm);
      expect(button.matchesElement(<Confirm>Import</Confirm>)).toBe(true);
    });

    describe('the import button', () => {
      it('calls the onImport prop when clicked', () => {
        getDialogButton().simulate('click');
        expect(onImport).toHaveBeenCalledWith('some-project', [], []);
      });

      it('passes the selected screens to the onImport prop function', () => {
        var checkboxSelector = dialog.find('MultiCheckboxSelector');
        const newSelected = [checkboxSelector.prop('items')[0]];
        checkboxSelector.prop('onChange')(newSelected);
        dialog.update();

        getDialogButton().simulate('click');
        expect(onImport).toHaveBeenCalledWith('some-project', newSelected, []);
      });
    });

    describe('the list of screens', () => {
      let checkboxSelector;
      beforeEach(() => {
        checkboxSelector = dialog.find('MultiCheckboxSelector');
      });

      it('should have a Screens header', () => {
        expect(checkboxSelector.prop('header')).toBe('Screens');
      });

      it('should have no selected screens initially', () => {
        expect(checkboxSelector.prop('selected')).toEqual([]);
      });

      it('should keep track of the selected screens when they are changed', () => {
        const newSelected = [checkboxSelector.prop('items')[0]];
        checkboxSelector.prop('onChange')(newSelected);
        dialog.update();
        checkboxSelector = dialog.find('MultiCheckboxSelector');
        expect(checkboxSelector.prop('selected')).toEqual(newSelected);
      });
    });
  });

  describe('When given other assets that can be imported', () => {
    let checkboxSelector;
    beforeEach(() => {
      onImport = jest.fn();
      dialog = shallow(
        <ImportScreensDialog
          hideBackdrop
          onImport={onImport}
          project={{
            id: 'some-project',
            name: 'Some Project',
            screens: [],
            otherAssets: [
              {filename: 'foo.png', category: 'image', willReplace: false},
              {filename: 'bar.mov', category: 'video', willReplace: true},
            ],
          }}
        />
      );
      checkboxSelector = dialog.find('MultiCheckboxSelector');
    });

    it('the import button passes the selected assets to the onImport prop function', () => {
      const newSelected = [checkboxSelector.prop('items')[0]];
      checkboxSelector.prop('onChange')(newSelected);
      dialog.update();

      getDialogButton().simulate('click');
      expect(onImport).toHaveBeenCalledWith('some-project', [], newSelected);
    });

    describe('the asset list', () => {
      it('should have a Screens header', () => {
        expect(checkboxSelector.prop('header')).toBe('Other Assets');
      });

      it('should have no selected screens initially', () => {
        expect(checkboxSelector.prop('selected')).toEqual([]);
      });

      it('should keep track of the selected screens when they are changed', () => {
        const newSelected = [checkboxSelector.prop('items')[0]];
        checkboxSelector.prop('onChange')(newSelected);
        dialog.update();
        checkboxSelector = dialog.find('MultiCheckboxSelector');
        expect(checkboxSelector.prop('selected')).toEqual(newSelected);
      });
    });
  });

  describe('When given screens that cannot be imported', () => {
    beforeEach(() => {
      const exampleHtml = `
        <div>
          <div class="screen" id="screen1">
            <img src="https://code.org/images/fit-320/avatars/hadi_partovi.jpg"
                 data-canonical-image-url="asset1.png"
                 id="img2">
          </div>
        </div>`;
      onImport = jest.fn();
      dialog = shallow(
        <ImportScreensDialog
          hideBackdrop
          onImport={onImport}
          project={{
            id: 'some-project',
            name: 'Some Project',
            screens: [
              {
                id: 'main_screen',
                willReplace: false,
                assetsToImport: [],
                assetsToReplace: [],
                canBeImported: false,
                conflictingIds: ['img2'],
                html: exampleHtml,
              },
            ],
            otherAssets: [],
          }}
        />
      );
    });

    it("renders a 'Cannot Import' section", () => {
      expect(
        dialog.matchesElement(
          <Dialog>
            <Body>
              <div>
                <div>
                  <h2>Cannot Import</h2>
                  <p>{IMPORT_FAILURE_MESSAGE}</p>
                  <ul>
                    <li>
                      <ScreenListItem
                        screen={dialog.prop('project').screens[0]}
                      />
                    </li>
                  </ul>
                </div>
              </div>
            </Body>
            <Buttons>
              <Cancel />
            </Buttons>
          </Dialog>
        )
      ).toBe(true);
    });
  });

  describe('When importing', () => {
    beforeEach(() => {
      const exampleHtml = `
        <div>
          <div class="screen" id="screen1">
            <img src="https://code.org/images/fit-320/avatars/hadi_partovi.jpg"
                 data-canonical-image-url="asset1.png"
                 id="img2">
          </div>
        </div>`;
      onImport = jest.fn();
      dialog = shallow(
        <ImportScreensDialog
          hideBackdrop
          onImport={onImport}
          isImporting={true}
          project={{
            id: 'some-project',
            name: 'Some Project',
            screens: [
              {
                id: 'main_screen',
                willReplace: true,
                assetsToImport: [],
                assetsToReplace: [],
                canBeImported: true,
                conflictingIds: [],
                html: exampleHtml,
              },
            ],
            otherAssets: [],
          }}
        />
      );
    });

    it('should disable the confirmation button', () => {
      expect(getDialogButton().prop('disabled')).toBe(true);
    });

    it('should disable the multi checkbox widget', () => {
      expect(dialog.find('MultiCheckboxSelector').prop('disabled')).toBe(true);
    });
  });
});
