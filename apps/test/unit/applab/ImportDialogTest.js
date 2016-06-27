import ReactTestUtils from 'react-addons-test-utils';
import React from 'react';

import {expect} from '../../util/configuredChai';
import {setupLocales} from '../../util/testUtils';
setupLocales();

// TODO(pcardune): remove this when code studio and apps are merged
window.React = React;

var Dialog = require('@cdo/apps/templates/DialogComponent');
var ImportScreensForm = require('@cdo/apps/applab/ImportScreensForm');
var ImportProjectForm = require('@cdo/apps/applab/ImportProjectForm');
var {ImportDialog} = require('@cdo/apps/applab/ImportDialog');

describe("Applab Screens ImportDialog component", function () {

  var renderer;

  beforeEach(() => {
    renderer = ReactTestUtils.createRenderer();
  });

  it("should start by showing the import project form", function () {
    renderer.render(<ImportDialog isOpen={false} handleClose={()=>null} />);
    var result = renderer.getRenderOutput();
    expect(result.type).to.equal(Dialog);
    expect(result.props.children.type).to.equal(ImportProjectForm);
  });

  it("should show the import screens form once a project has been fetched", () => {
    renderer.render(<ImportDialog isOpen={false} handleClose={()=>null} />);
    var result = renderer.getRenderOutput();
    result.props.children.props.onProjectFetched({
      channel: {name: 'some-project'},
      sources: {html: '<div>some html</div>'},
    });
    result = renderer.getRenderOutput();
    expect(result.props.children.type).to.equal(ImportScreensForm);
  });

});
