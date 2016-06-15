import ReactTestUtils from 'react-addons-test-utils';
import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import {expect} from '../../util/configuredChai';
import {setupLocales} from '../../util/testUtils';
setupLocales();

var ImportScreensForm = require('@cdo/apps/applab/ImportScreensForm').default;
var ScreenListItem = require('@cdo/apps/applab/ImportScreensForm').ScreenListItem;

describe("Applab ImportScreensForm component", function () {

  var form, onImport, project, importButton, screenItems, designModeViz;

  function setExistingHTML(existingHTML) {
    designModeViz.innerHTML = existingHTML;
  }

  function setHTMLToImport(toImport) {
    project = {
      channel: {
        name: 'some-other-project',
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
  });
  afterEach(() => {
    designModeViz.parentNode.removeChild(designModeViz);
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
  });

  describe('When doing an import into a project with conflicting assets', () => {
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
        expect(screenItems[0].text()).to.include('screen3');
        expect(form.find(ScreenListItem).at(0).prop('disabled')).not.to.be.true;
        expect(screenItems[1].text()).to.include('screen2');
        expect(form.find(ScreenListItem).at(1).prop('disabled')).to.be.true;
      });
    });

    describe('the screen list items', () => {
      it("should display a warning when they are disabled", () => {
        expect(screenItems[1].text()).to.include('Uses existing element IDs: "input2".');
      });
    });
  });

});
