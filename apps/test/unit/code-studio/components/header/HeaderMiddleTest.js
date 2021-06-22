var assert = require('assert');

import HeaderMiddle from '@cdo/apps/code-studio/components/header/HeaderMiddle';

// Disable prettier so that we can indent the parameter name comments consistently.
/* eslint-disable prettier/prettier */

describe('HeaderMiddle', () => {
  it('widths for hourof code when wide', () => {
    const widths = HeaderMiddle.getWidths(
      700, // width,
      false, // projectInfoOnly,
      0, // projectInfoDesiredWidth,
      200, // unitNameDesiredWidth,
      350, // lessonProgressDesiredWidth,
      0, // numUnitLessons,
      200, // finishDesiredWidth,
      true // showFinish
    );

    assert.equal(widths.left, 0);
    assert.equal(widths.projectInfo, 0);
    assert.equal(widths.scriptName, 170);
    assert.equal(widths.progress, 360);
    assert.equal(widths.popup, 0);
    assert.equal(widths.finish, 170);
    assert.equal(widths.showPopupBecauseProgressCropped, false);
  });

  it('widths for hourof code when narrow', () => {
    const widths = HeaderMiddle.getWidths(
      350, // width,
      false, // projectInfoOnly,
      0, // projectInfoDesiredWidth,
      200, // unitNameDesiredWidth,
      350, // lessonProgressDesiredWidth,
      0, // numUnitLessons,
      200, // finishDesiredWidth,
      true // showFinish
    );

    assert.equal(widths.left, 0);
    assert.equal(widths.projectInfo, 0);
    assert.equal(widths.scriptName, 50);
    assert.equal(widths.progress, 210);
    assert.equal(widths.popup, 40);
    assert.equal(widths.finish, 50);
    assert.equal(widths.showPopupBecauseProgressCropped, true);
  });

  it('widths for regular level with project info when wide', () => {
    const widths = HeaderMiddle.getWidths(
      700, // width,
      false, // projectInfoOnly,
      200, // projectInfoDesiredWidth,
      200, // unitNameDesiredWidth,
      350, // lessonProgressDesiredWidth,
      5, // numUnitLessons,
      0, // finishDesiredWidth,
      false // showFinish
    );

    assert.equal(widths.left, 0);
    assert.equal(widths.projectInfo, 200);
    assert.equal(widths.scriptName, 160);
    assert.equal(widths.progress, 300);
    assert.equal(widths.popup, 40);
    assert.equal(widths.finish, 0);
    assert.equal(widths.showPopupBecauseProgressCropped, false);
  });

  it('widths for regular level with project info when narrow', () => {
    const widths = HeaderMiddle.getWidths(
      350, // width,
      false, // projectInfoOnly,
      200, // projectInfoDesiredWidth,
      200, // unitNameDesiredWidth,
      350, // lessonProgressDesiredWidth,
      5, // numUnitLessons,
      0, // finishDesiredWidth,
      false // showFinish
    );

    assert.equal(widths.left, 0);
    assert.equal(widths.projectInfo, 105);
    assert.equal(widths.scriptName, 58);
    assert.equal(widths.progress, 147);
    assert.equal(widths.popup, 40);
    assert.equal(widths.finish, 0);
    assert.equal(widths.showPopupBecauseProgressCropped, false);
  });

  it('widths for project info only when wide', () => {
    const widths = HeaderMiddle.getWidths(
      700, // width,
      true, // projectInfoOnly,
      400, // projectInfoDesiredWidth,
      0, // unitNameDesiredWidth,
      0, // lessonProgressDesiredWidth,
      0, // numUnitLessons,
      0, // finishDesiredWidth,
      false // showFinish
    );

    assert.equal(widths.projectInfo, 400);
    assert.equal(widths.scriptName, 0);
    assert.equal(widths.progress, 0);
    assert.equal(widths.popup, 0);
    assert.equal(widths.finish, 0);
  });

  it('widths for project info only when narrow', () => {
    const widths = HeaderMiddle.getWidths(
      350, // width,
      true, // projectInfoOnly,
      400, // projectInfoDesiredWidth,
      0, // unitNameDesiredWidth,
      0, // lessonProgressDesiredWidth,
      0, // numUnitLessons,
      0, // finishDesiredWidth,
      false // showFinish
    );

    assert.equal(widths.projectInfo, 350);
    assert.equal(widths.scriptName, 0);
    assert.equal(widths.progress, 0);
    assert.equal(widths.popup, 0);
    assert.equal(widths.finish, 0);
  });
});
