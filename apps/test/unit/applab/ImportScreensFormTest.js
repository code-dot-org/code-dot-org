import ReactTestUtils from 'react-addons-test-utils';
import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import {expect} from '../../util/configuredChai';
import {setupLocales} from '../../util/testUtils';
setupLocales();

var designMode = require('@cdo/apps/applab/designMode');
var ImportScreensForm = require('@cdo/apps/applab/ImportScreensForm').default;
var ScreenListItem = require('@cdo/apps/applab/ImportScreensForm').ScreenListItem;
var assetsApi = require('@cdo/apps/clientApi').assets;

describe("Applab ImportScreensForm component", function () {

  var form, onImport, project, importButton, screenItems, designModeViz;

  function setExistingHTML(existingHTML) {
    designModeViz.innerHTML = existingHTML;
  }

  function setHTMLToImport(toImport) {
    project = {
      channel: {
        name: 'Some Other Project!',
        id: 'some-other-project',
      },
      sources: {
        html: `<div>${toImport}</div>`,
      },
    };
  }

  function update() {
    form.update();
    importButton = form.find('button');
    screenItems = form.find(ScreenListItem).map(s => s.shallow());
  }

  function renderForm({existingHTML, toImport}) {
    setExistingHTML(existingHTML);
    setHTMLToImport(toImport);
    onImport = sinon.spy();
    form = shallow(<ImportScreensForm onImport={onImport} project={project} />);
    update();
  }

  beforeEach(() => {
    designModeViz = document.createElement('div');
    designModeViz.id = "designModeViz";
    document.body.appendChild(designModeViz);
    sinon.stub(designMode, 'changeScreen');
    sinon.stub(assetsApi, 'copyAssets');
  });
  afterEach(() => {
    designModeViz.parentNode.removeChild(designModeViz);
    designMode.changeScreen.restore();
    assetsApi.copyAssets.restore();
  });

  describe('When doing an import into an empty project', () => {
    describe("the form", () => {
      beforeEach(() => {
        renderForm({
          existingHTML:``,
          toImport:`
            <div class="screen" id="screen1"></div>
            <div class="screen" id="screen2"></div>
          `
        });
      });

      it('includes a screen list item for each screen to be imported', () => {
        expect(form.find(ScreenListItem)).to.have.length(2);
      });

      it('automatically selects each screen to be imported', () => {
        expect(form.find(ScreenListItem).filterWhere(c => c.prop('selected'))).to.have.length(2);
      });

      it("displays an import button", () => {
        expect(importButton).to.have.length(1);
      });
    });
    describe("the screen list items", () => {
      it('show the id of the screen', () => {
        expect(screenItems[0].text()).to.equal('screen1');
        expect(screenItems[1].text()).to.equal('screen2');
      });
      it('show a checkbox that is checked', () => {
        expect(screenItems[0].find('input').prop('checked')).to.be.true;
        expect(screenItems[1].find('input').prop('checked')).to.be.true;
      });
      it('checkboxes can be checked or unchecked', () => {
        expect(screenItems[0].find('input').prop('checked')).to.be.true;
        screenItems[0].find('input').simulate('change');
        update();
        expect(screenItems[0].find('input').prop('checked')).not.to.be.true;
        screenItems[0].find('input').simulate('change');
        update();
        expect(screenItems[0].find('input').prop('checked')).to.be.true;
      });
    });

    describe("the import screens button", () => {
      it('adds the imported screens to the project', () => {
        expect(designMode.getAllScreenIds()).to.have.length(0);
        importButton.simulate('click');
        expect(designMode.getAllScreenIds()).to.have.length(2);
        expect(designMode.getAllScreenIds()).to.include('screen1');
        expect(designMode.getAllScreenIds()).to.include('screen2');
      });

      it('calls the onImport prop callback when finished', () => {
        importButton.simulate('click');
        expect(onImport).to.have.been.called;
      });
    });
  });

  describe('When doing an import into a project with conflicting screens', () => {
    beforeEach(() => {
      renderForm({
        existingHTML:`
          <div class="screen" id="design_screen1"></div>
        `,
        toImport:`
          <div class="screen" id="screen1"></div>
          <div class="screen" id="screen2"></div>
        `
      });
    });

    describe('the screen list items', () => {
      it('should render a warning message if importing will replace an existing screen', () => {
        expect(screenItems[0].text()).to.include(
          'Importing this will replace your existing screen: "screen1".'
        );
        expect(screenItems[1].text()).not.to.include(
          'Importing this will replace your existing screen'
        );
      });
      it('should still automatically select the screen items', () => {
        expect(screenItems[0].find('input').prop('checked')).to.be.true;
        expect(screenItems[1].find('input').prop('checked')).to.be.true;
      });
    });

    describe("the import screens button", () => {
      it('adds the imported screens to the project, replacing the ones with the same name', () => {
        expect(designMode.getAllScreenIds()).to.have.length(1);
        importButton.simulate('click');
        expect(designMode.getAllScreenIds()).to.have.length(2);
        expect(designMode.getAllScreenIds()).to.include('screen1');
        expect(designMode.getAllScreenIds()).to.include('screen2');
      });
    });

  });

  describe('When doing an import into a project with conflicting assets', () => {
    var server;
    beforeEach(() => {
      server = sinon.fakeServerWithClock.create();
      server.respondWith(
        '/v3/assets/some-project/asset1.png',
        'some project asset 1'
      );
      server.respondWith(
        '/v3/assets/some-other-project/asset1.png',
        'some other project asset 1'
      );
    });
    afterEach(() => {
      server.restore();
    });
    beforeEach(() => {
      renderForm({
        existingHTML:`
          <div class="screen" id="design_screen1">
            <img src="/v3/assets/some-project/asset1.png"
                 data-canonical-image-url="asset1.png"
                 id="design_img1">
          </div>
        `,
        toImport:`
          <div class="screen" id="screen1">
            <img src="/v3/assets/some-other-project/asset1.png"
                 data-canonical-image-url="asset1.png"
                 id="img2">
          </div>
          <div class="screen" id="screen2"></div>
        `
      });
    });

    describe('the screen list items', () => {
      it('should render a warning message if importing will replace an existing asset', () => {
        expect(screenItems[0].text()).to.include(
          'Importing this will replace your existing assets: "asset1.png".'
        );
        expect(screenItems[1].text()).not.to.include(
          'Importing this will replace your existing assets'
        );
      });
      it('should still automatically select the screen items', () => {
        expect(screenItems[0].find('input').prop('checked')).to.be.true;
        expect(screenItems[1].find('input').prop('checked')).to.be.true;
      });
    });

    describe("the import screens button", () => {
      it('should still import screens to the project, replacing the ones with the same name', () => {
        expect(designMode.getAllScreenIds()).to.have.length(1);
        importButton.simulate('click');
        expect(designMode.getAllScreenIds()).to.have.length(2);
        expect(designMode.getAllScreenIds()).to.include('screen1');
        expect(designMode.getAllScreenIds()).to.include('screen2');
      });

      it('should also replace the assets', () => {
        importButton.simulate('click');
        expect(assetsApi.copyAssets).to.have.been.calledWith(
          'some-other-project',
          ['asset1.png'],
          sinon.match.func,
          sinon.match.func
        );
      });

      it('should not call the onImport callback until the assets have been replaced', () => {
        importButton.simulate('click');
        expect(onImport).not.to.have.been.called;
        var [,, success] = assetsApi.copyAssets.lastCall.args;
        success();
        expect(onImport).to.have.been.called;
      });
    });

  });

  describe('When doing an import into a project that uses the same element IDs', () => {
    beforeEach(() => {
      renderForm({
        existingHTML:`
          <div class="screen" id="design_screen1">
            <input id="design_input1">
            <input id="design_input2">
          </div>
        `,
        toImport:`
          <div class="screen" id="screen1">
            <input id="input1">
          </div>
          <div class="screen" id="screen2">
            <input id="input2">
          </div>
          <div class="screen" id="screen3">
            <input id="input3">
          </div>
        `
      });
    });

    describe('the form', () => {
      it("should render a Cannot Import section", () => {
        expect(form.text()).to.include('Cannot Import');
      });
      it("should set the screen list items to be disabled if they cannot be imported", () => {
        expect(screenItems[0].text()).to.include('screen1');
        expect(form.find(ScreenListItem).at(0).prop('disabled')).not.to.be.true;
        expect(screenItems[1].text()).to.include('screen3');
        expect(form.find(ScreenListItem).at(1).prop('disabled')).not.to.be.true;
        expect(screenItems[2].text()).to.include('screen2');
        expect(form.find(ScreenListItem).at(2).prop('disabled')).to.be.true;
      });
    });

    describe('the screen list items', () => {
      it("should display a warning when they are disabled", () => {
        expect(screenItems[2].text()).to.include('Uses existing element IDs: "input2".');
      });
    });
  });

});
