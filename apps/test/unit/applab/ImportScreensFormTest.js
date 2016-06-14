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

  var form, onImport, project, importButton, designModeViz;

  beforeEach(() => {
    designModeViz = document.createElement('div');
    designModeViz.id = "designModeViz";
    document.body.appendChild(designModeViz);
    designModeViz.innerHTML = `
<div class="screen" id="design_first_screen">
  <img src="/v3/assets/some-project/asset1.png"
       data-canonical-image-url="asset1.png"
       id="img1">
</div>
`;

    onImport = sinon.spy();
    project = {
      channel: {
        name: 'some-project',
      },
      sources: {
        html: `
<div>
  <div class="screen" id="first_screen">
  </div>
  <div class="screen" id="second_screen">
    <img src="/v3/assets/some-project/asset1.png"
         data-canonical-image-url="asset1.png"
         id="img1">
  </div>
  <div class="screen" id="third_screen"></div>
</div>
`,
      },
    };
    form = shallow(<ImportScreensForm onImport={onImport} project={project} />);
    update();
  });

  afterEach(() => {
    designModeViz.parentNode.removeChild(designModeViz);
  });

  function update() {
    form.update();
    importButton = form.find('button');
  }

  it("renders a list of screens", () => {
    expect(form.find(ScreenListItem)).to.have.length(3);
  });

  it("renders an import button", () => {
    expect(importButton).to.have.length(1);
  });

  describe("ScreenListItem component", function () {
    var screenItems;

    beforeEach(() => {
      screenItems = form.find(ScreenListItem).map(s => s.shallow());
    });

    it("should render a warning message if importing will replace an existing screen", () => {
      expect(screenItems[0].text()).to.include(
        'Importing this will replace your existing screen: "first_screen".'
      );
      expect(screenItems[1].text()).not.to.include(
        'Importing this will replace your existing screen'
      );
    });

    it("should render a warning message if importing will replace an existing asset", () => {
      expect(screenItems[1].text()).to.include(
        'Importing this will replace your existing assets: "asset1.png".'
      );
    });

  });

});
