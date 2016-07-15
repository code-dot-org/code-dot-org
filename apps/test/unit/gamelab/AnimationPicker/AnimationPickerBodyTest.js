import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import {expect} from '../../../util/configuredChai';

// We have to setup the gamelab locale before importing AnimationPickerBody
// TODO: Make testUtils exports Babel-ES6-friendly
let testUtils = require('../../../util/testUtils');
testUtils.setupLocale('gamelab');
const gamelabMsg = require('@cdo/apps/gamelab/locale');

// We use `require` here because imports get hoisted, and we have to run
// setupLocale before importing AnimationPickerBody.
const moduleUnderTest = require('@cdo/apps/gamelab/AnimationPicker/AnimationPickerBody');
const AnimationPickerBody = moduleUnderTest.default;
const WarningLabel = moduleUnderTest.WarningLabel;

describe('AnimationPickerBody', function () {
  it('shows an upload warning if the user is under 13', function () {
    let renderer = ReactTestUtils.createRenderer();
    const emptyFunction = function () {};
    renderer.render(
        <AnimationPickerBody
            is13Plus={false}
            onDrawYourOwnClick={emptyFunction}
            onPickLibraryAnimation={emptyFunction}
            onUploadClick={emptyFunction}
        />
    );
    const output = renderer.getRenderOutput();
    const renderedWarning = React.Children.toArray(output.props.children)
        .find(child => child.type === WarningLabel);
    expect(renderedWarning).not.to.be.undefined;
    expect(renderedWarning.props.children).to.equal(gamelabMsg.animationPicker_warning());
  });
});
