/* eslint no-unused-vars: "error" */
import React from 'react';
import sinon from 'sinon';
import { shallow, mount } from 'enzyme';
import MultiCheckboxSelector from '@cdo/apps/templates/MultiCheckboxSelector';
import {expect} from '../../util/configuredChai';
import Dialog, {Body, Buttons, Confirm, Cancel} from '@cdo/apps/templates/Dialog';
import {
  ImportScreensDialog,
  ScreenListItem,
  AssetListItem
} from '@cdo/apps/applab/ImportScreensDialog';
import AssetThumbnail from '@cdo/apps/code-studio/components/AssetThumbnail';

describe("AssetListItem", () => {
  var item;

  it("Will only show the filename when it is not replacing an existing asset", () => {
    item = shallow(
      <AssetListItem
        asset={{filename: 'bar.mp3', category: "audio", willReplace: false}}
      />
    );
    expect(item.matchesElement(
      <div>
        <AssetThumbnail type="audio" name="bar.mp3" />
        <div>bar.mp3</div>
      </div>
    )).to.be.true;
  });

  it("will show a warning when replacing an existing asset", () => {
    item = shallow(
      <AssetListItem
        asset={{filename: 'bar.mp3', category: "audio", willReplace: true}}
      />
    );
    expect(item.text()).to.contain(
      'Warning: Importing this will replace your existing "bar.mp3".'
    );
  });

  it("uses the current project id when no other id is specified", () => {
    const itemWithoutProjectId = mount(
      <AssetListItem
        asset={{filename: 'bar.png', category: 'image', willReplace: false}}
      />
    );
    expect(itemWithoutProjectId.find('img').prop('src')).to.contain("/v3/assets/undefined/bar.png");
  });

  it("uses the specified project's id", () => {
    const itemWithProjectId = mount(
      <AssetListItem
        projectId="1234"
        asset={{filename: 'bar.png', category: 'image', willReplace: false}}
      />
    );
    expect(itemWithProjectId.find('img').prop('src')).to.contain("/v3/assets/1234/bar.png");
  });
});

describe("ScreenListItem", () => {
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
    expect(item.text()).to.contain('main_screen');
  });

  it("Will show a warning when replacing another screen", () => {
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
    expect(item.text()).to.contain('main_screen');
    expect(item.text()).to.contain('Importing this will replace your existing screen: "main_screen".');
  });

  it("Will show a warning when replacing another screen with assets", () => {
    item = shallow(
      <ScreenListItem
        screen={{
            id: 'main_screen',
            willReplace: true,
            assetsToImport: [],
            assetsToReplace: ['foo.png','bar.png'],
            canBeImported: true,
            conflictingIds: [],
            html: '',
          }}
      />
    );
    expect(item.text()).to.contain('main_screen');
    expect(item.text()).to.contain('Importing this will replace your existing screen: "main_screen".');
    expect(item.text()).to.contain('Importing this will replace your existing assets: "foo.png", "bar.png".');
  });

  it("Will show the list of conflicting Ids if there are any", () => {
    item = shallow(
      <ScreenListItem
        screen={{
            id: 'main_screen',
            willReplace: true,
            assetsToImport: [],
            assetsToReplace: ['foo.png','bar.png'],
            canBeImported: false,
            conflictingIds: ['input1', 'input2'],
            html: '',
          }}
      />
    );
    expect(item.text()).to.contain('main_screen');
    expect(item.text()).to.contain('Uses existing element IDs: "input1", "input2".');
    // we don't want to show other errors related to importing.
    expect(item.text()).not.to.contain('Importing this will replace your existing assets');
    expect(item.text()).not.to.contain('Importing this will replace your existing screen');
  });

});

describe("ImportScreensDialog", () => {
  let dialog, onImport;

  function getDialogButton() {
    return dialog.children().at(1).children().at(0);
  }

  describe("When given a list of screens", () => {
    beforeEach(() => {
      const exampleHtml = `
        <div>
          <div class="screen" id="screen1">
            <img src="https://code.org/images/fit-320/avatars/hadi_partovi.jpg"
                 data-canonical-image-url="asset1.png"
                 id="img2">
          </div>
        </div>`;
      onImport = sinon.spy();
      dialog = shallow(
        <ImportScreensDialog
          hideBackdrop
          onImport={onImport}
          project={{
              id: 'some-project',
              name: 'Some Project',
              screens: [{
                id: 'main_screen',
                willReplace: true,
                assetsToImport: [],
                assetsToReplace: [],
                canBeImported: true,
                conflictingIds: [],
                html: exampleHtml,
              }],
              otherAssets: [],
            }}
        />
      );
    });

    it("renders a dialog with the list of screens", () => {
      expect(dialog.type()).to.equal(Dialog);
      expect(dialog.children().at(0).type()).to.equal(Body);
      expect(dialog.children().at(1).type()).to.equal(Buttons);
      expect(dialog).to.have.exactly(1).descendants(MultiCheckboxSelector);
    });

    it("renders an Import button which calls onImport when clicked", () => {
      const button = getDialogButton();
      expect(button.type()).to.equal(Confirm);
      expect(button.matchesElement(<Confirm>Import</Confirm>)).to.be.true;
    });

    describe("the import button", () => {
      it("calls the onImport prop when clicked", () => {
        getDialogButton().simulate('click');
        expect(onImport.calledWith('some-project', [], [])).to.be.true;
      });

      it("passes the selected screens to the onImport prop function", () => {
        var checkboxSelector = dialog.find('MultiCheckboxSelector');
        const newSelected = [checkboxSelector.prop('items')[0]];
        checkboxSelector.prop('onChange')(newSelected);
        dialog.update();

        getDialogButton().simulate('click');
        expect(onImport.calledWith('some-project', newSelected, [])).to.be.true;
      });
    });

    describe("the list of screens", () => {
      let checkboxSelector;
      beforeEach(() => {
        checkboxSelector = dialog.find('MultiCheckboxSelector');
      });

      it("should have a Screens header", () => {
        expect(checkboxSelector).to.have.prop('header').to.equal('Screens');
      });

      it("should have no selected screens initially", () => {
        expect(checkboxSelector).to.have.prop('selected').to.deep.equal([]);
      });

      it("should keep track of the selected screens when they are changed", () => {
        const newSelected = [checkboxSelector.prop('items')[0]];
        checkboxSelector.prop('onChange')(newSelected);
        dialog.update();
        checkboxSelector = dialog.find('MultiCheckboxSelector');
        expect(checkboxSelector).to.have.prop('selected').to.deep.equal(newSelected);
      });
    });
  });

  describe("When given other assets that can be imported", () => {
    let checkboxSelector;
    beforeEach(() => {
      onImport = sinon.spy();
      dialog = shallow(
        <ImportScreensDialog
          hideBackdrop
          onImport={onImport}
          project={{
              id: 'some-project',
              name: 'Some Project',
              screens: [],
              otherAssets: [
                {filename: 'foo.png', category: "image", willReplace: false},
                {filename: 'bar.mov', category: "video", willReplace: true},
              ],
            }}
        />
      );
      checkboxSelector = dialog.find('MultiCheckboxSelector');
    });

    it("the import button passes the selected assets to the onImport prop function", () => {
      const newSelected = [checkboxSelector.prop('items')[0]];
      checkboxSelector.prop('onChange')(newSelected);
      dialog.update();

      getDialogButton().simulate('click');
      expect(onImport.calledWith('some-project', [], newSelected)).to.be.true;
    });

    describe("the asset list", () => {

      it("should have a Screens header", () => {
        expect(checkboxSelector).to.have.prop('header').to.equal('Other Assets');
      });

      it("should have no selected screens initially", () => {
        expect(checkboxSelector).to.have.prop('selected').to.deep.equal([]);
      });

      it("should keep track of the selected screens when they are changed", () => {
        const newSelected = [checkboxSelector.prop('items')[0]];
        checkboxSelector.prop('onChange')(newSelected);
        dialog.update();
        checkboxSelector = dialog.find('MultiCheckboxSelector');
        expect(checkboxSelector).to.have.prop('selected').to.deep.equal(newSelected);
      });
    });
  });

  describe("When given screens that cannot be imported", () => {
    beforeEach(() => {
      const exampleHtml = `
        <div>
          <div class="screen" id="screen1">
            <img src="https://code.org/images/fit-320/avatars/hadi_partovi.jpg"
                 data-canonical-image-url="asset1.png"
                 id="img2">
          </div>
        </div>`;
      onImport = sinon.spy();
      dialog = shallow(
        <ImportScreensDialog
          hideBackdrop
          onImport={onImport}
          project={{
              id: 'some-project',
              name: 'Some Project',
              screens: [{
                id: 'main_screen',
                willReplace: false,
                assetsToImport: [],
                assetsToReplace: [],
                canBeImported: false,
                conflictingIds: ['img2'],
                html: exampleHtml,
              }],
              otherAssets: [],
            }}
        />
      );
    });

    it("renders a 'Cannot Import' section", () => {
      expect(dialog.matchesElement(
        <Dialog>
          <Body>
            <div>
              <div>
                <h2>Cannot Import</h2>
                <p>
                  Cannot import the following screens because they contain design elements
                  with IDs already used in your existing project. Fix the IDs in either
                  project so they aren't duplicated across different screens before trying
                  to import the following.
                </p>
                <ul>
                  <li>
                    <ScreenListItem screen={dialog.prop('project').screens[0]}/>
                  </li>
                </ul>
              </div>
            </div>
          </Body>
          <Buttons>
            <Cancel />
          </Buttons>
        </Dialog>
      )).to.be.true;
    });
  });

  describe("When importing", () => {
    beforeEach(() => {
      const exampleHtml = `
        <div>
          <div class="screen" id="screen1">
            <img src="https://code.org/images/fit-320/avatars/hadi_partovi.jpg"
                 data-canonical-image-url="asset1.png"
                 id="img2">
          </div>
        </div>`;
      onImport = sinon.spy();
      dialog = shallow(
        <ImportScreensDialog
          hideBackdrop
          onImport={onImport}
          isImporting={true}
          project={{
              id: 'some-project',
              name: 'Some Project',
              screens: [{
                id: 'main_screen',
                willReplace: true,
                assetsToImport: [],
                assetsToReplace: [],
                canBeImported: true,
                conflictingIds: [],
                html: exampleHtml,
              }],
              otherAssets: [],
            }}
        />
      );
    });

    it("should disable the confirmation button", () => {
      expect(getDialogButton().prop('disabled')).to.be.true;
    });

    it("should disable the multi checkbox widget", () => {
      expect(dialog.find('MultiCheckboxSelector').prop('disabled')).to.be.true;
    });
  });

});
