import HeaderMiddle from '@cdo/apps/code-studio/components/header/HeaderMiddle';

// Disable prettier so that we can indent the parameter name comments consistently.
/* eslint-disable prettier/prettier */

describe('HeaderMiddle', () => {
  it('widths for hourof code when wide', () => {
    const widths = HeaderMiddle.getWidths(
      700,    // width,
      false,  // projectInfoOnly,
      false,  // scriptNameOnly,
      0,      // projectInfoDesiredWidth,
      200,    // scriptNameDesiredWidth,
      350,    // lessonProgressDesiredWidth,
      0,      // numScriptLessons,
      200,    // finishDesiredWidth,
      true    // showFinish
    );

    expect(widths.left).toEqual(0);
    expect(widths.projectInfo).toEqual(0);
    expect(widths.scriptName).toEqual(170);
    expect(widths.progress).toEqual(360);
    expect(widths.popup).toEqual(0);
    expect(widths.finish).toEqual(170);
    expect(widths.showPopupBecauseProgressCropped).toEqual(false);
  });

  it('widths for hourof code when narrow', () => {
    const widths = HeaderMiddle.getWidths(
      350,    // width,
      false,  // projectInfoOnly,
      false,  // scriptNameOnly,
      0,      // projectInfoDesiredWidth,
      200,    // scriptNameDesiredWidth,
      350,    // lessonProgressDesiredWidth,
      0,      // numScriptLessons,
      200,    // finishDesiredWidth,
      true    // showFinish
    );

    expect(widths.left).toEqual(0);
    expect(widths.projectInfo).toEqual(0);
    expect(widths.scriptName).toEqual(50);
    expect(widths.progress).toEqual(210);
    expect(widths.popup).toEqual(40);
    expect(widths.finish).toEqual(50);
    expect(widths.showPopupBecauseProgressCropped).toEqual(true);
  });

  it('widths for regular level with project info when wide', () => {
    const widths = HeaderMiddle.getWidths(
      700,    // width,
      false,  // projectInfoOnly,
      false,  // scriptNameOnly,
      200,    // projectInfoDesiredWidth,
      200,    // scriptNameDesiredWidth,
      350,    // lessonProgressDesiredWidth,
      5,      // numScriptLessons,
      0,      // finishDesiredWidth,
      false   // showFinish
    );

    expect(widths.left).toEqual(0);
    expect(widths.projectInfo).toEqual(200);
    expect(widths.scriptName).toEqual(160);
    expect(widths.progress).toEqual(300);
    expect(widths.popup).toEqual(40);
    expect(widths.finish).toEqual(0);
    expect(widths.showPopupBecauseProgressCropped).toEqual(false);
  });

  it('widths for regular level with project info when narrow', () => {
    const widths = HeaderMiddle.getWidths(
      350,    // width,
      false,  // projectInfoOnly,
      false,  // scriptNameOnly,
      200,    // projectInfoDesiredWidth,
      200,    // scriptNameDesiredWidth,
      350,    // lessonProgressDesiredWidth,
      5,      // numScriptLessons,
      0,      // finishDesiredWidth,
      false   // showFinish
    );

    expect(widths.left).toEqual(0);
    expect(widths.projectInfo).toEqual(105);
    expect(widths.scriptName).toEqual(58);
    expect(widths.progress).toEqual(147);
    expect(widths.popup).toEqual(40);
    expect(widths.finish).toEqual(0);
    expect(widths.showPopupBecauseProgressCropped).toEqual(false);
  });

  it('widths for project info only when wide', () => {
    const widths = HeaderMiddle.getWidths(
      700,    // width,
      true,   // projectInfoOnly,
      false,  // scriptNameOnly,
      400,    // projectInfoDesiredWidth,
      0,      // scriptNameDesiredWidth,
      0,      // lessonProgressDesiredWidth,
      0,      // numScriptLessons,
      0,      // finishDesiredWidth,
      false   // showFinish
    );

    expect(widths.projectInfo).toEqual(400);
    expect(widths.scriptName).toEqual(0);
    expect(widths.progress).toEqual(0);
    expect(widths.popup).toEqual(0);
    expect(widths.finish).toEqual(0);
  });

  it('widths for project info only when narrow', () => {
    const widths = HeaderMiddle.getWidths(
      350,    // width,
      true,   // projectInfoOnly,
      false,  // scriptNameOnly,
      400,    // projectInfoDesiredWidth,
      0,      // scriptNameDesiredWidth,
      0,      // lessonProgressDesiredWidth,
      0,      // numScriptLessons,
      0,      // finishDesiredWidth,
      false   // showFinish
    );

    expect(widths.projectInfo).toEqual(350);
    expect(widths.scriptName).toEqual(0);
    expect(widths.progress).toEqual(0);
    expect(widths.popup).toEqual(0);
    expect(widths.finish).toEqual(0);
  });

  it('widths for script name only when wide', () => {
    const widths = HeaderMiddle.getWidths(
      700,    // width,
      false,  // projectInfoOnly,
      true,   // scriptNameOnly,
      0,      // projectInfoDesiredWidth,
      400,    // scriptNameDesiredWidth,
      0,      // lessonProgressDesiredWidth,
      0,      // numScriptLessons,
      0,      // finishDesiredWidth,
      false   // showFinish
    );

    expect(widths.projectInfo).toEqual(0);
    expect(widths.scriptName).toEqual(410);
    expect(widths.progress).toEqual(0);
    expect(widths.popup).toEqual(0);
    expect(widths.finish).toEqual(0);
  });

  it('widths for script name only when narrow', () => {
    const widths = HeaderMiddle.getWidths(
      350,    // width,
      false,  // projectInfoOnly,
      true,   // scriptNameOnly,
      0,      // projectInfoDesiredWidth,
      400,    // scriptNameDesiredWidth,
      0,      // lessonProgressDesiredWidth,
      0,      // numScriptLessons,
      0,      // finishDesiredWidth,
      false   // showFinish
    );

    expect(widths.projectInfo).toEqual(0);
    expect(widths.scriptName).toEqual(350);
    expect(widths.progress).toEqual(0);
    expect(widths.popup).toEqual(0);
    expect(widths.finish).toEqual(0);
  });
});
