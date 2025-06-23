import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import EditorAnnotator from '@cdo/apps/EditorAnnotator';
import {
  singleton as studioApp,
  stubStudioApp,
  restoreStudioApp,
} from '@cdo/apps/StudioApp';
import {
  annotateLines,
  clearAnnotations,
} from '@cdo/apps/templates/rubrics/annotateEditor';
import tipIconImage from '@cdo/apps/templates/rubrics/images/AiBot_Icon.svg';
import infoIconImage from '@cdo/apps/templates/rubrics/images/info-icon.svg';

import {expect as deprecatedExpect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

// These are test observations that would be given by the AI.
const observations = 'This is an observation. This is another observation.';

const code = `// code
    var x = 5;
    var y = 6;
    // add them together
    /*
    var z = x + y;
    */
    draw();

    if (something) {
      doSomething();
    }

    exit();
  `;

describe('annotateLines', () => {
  let annotatorStub,
    annotateLineStub,
    scrollToLineStub,
    highlightLineStub,
    clearAnnotationsStub,
    clearHighlightedLinesStub,
    oldEditor;

  function stubAnnotator() {
    stubStudioApp();
    oldEditor = studioApp().editor;
    studioApp().editor = undefined;

    // Stub out our references to the singleton and editor
    let annotatorInstanceStub = sinon.stub();
    annotatorInstanceStub.getCode = sinon.stub().returns(code);
    annotatorStub = sinon
      .stub(EditorAnnotator, 'annotator')
      .returns(annotatorInstanceStub);
    annotateLineStub = sinon.stub(EditorAnnotator, 'annotateLine');
    scrollToLineStub = sinon.stub(EditorAnnotator, 'scrollToLine');
    clearAnnotationsStub = sinon.stub(EditorAnnotator, 'clearAnnotations');
    highlightLineStub = sinon.stub(EditorAnnotator, 'highlightLine');
    clearHighlightedLinesStub = sinon.stub(
      EditorAnnotator,
      'clearHighlightedLines'
    );
  }

  function restoreAnnotator() {
    annotatorStub.restore();
    scrollToLineStub.restore();
    annotateLineStub.restore();
    clearAnnotationsStub.restore();
    highlightLineStub.restore();
    clearHighlightedLinesStub.restore();
    studioApp().editor = oldEditor;
    studioApp().removeAllListeners('afterInit');
    restoreStudioApp();
  }

  beforeEach(() => {
    stubAnnotator();
  });
  afterEach(() => {
    restoreAnnotator();
  });

  it('should do nothing if the AI observation does not reference any lines', () => {
    // The AI tends to misreport the line number, so we shouldn't rely on it
    annotateLines('This is just a basic observation.', observations);
    deprecatedExpect(annotateLineStub.notCalled).to.be.true;
  });

  it('should annotate a single line of code referenced by the AI', () => {
    // The AI tends to misreport the line number, so we shouldn't rely on it
    annotateLines('Line 1: This is a line of code `var x = 5;`', observations);
    sinon.assert.calledWith(annotateLineStub, 2, 'This is a line of code');
  });

  it('should annotate a truncated line of code referenced by the AI', () => {
    // The AI tends to misreport the line number, so we shouldn't rely on it
    annotateLines(
      'Line 1: This is a line of code `if (something) { ... }`',
      observations
    );
    sinon.assert.calledWith(annotateLineStub, 10, 'This is a line of code');
  });

  it('should annotate the first line of code referenced by the AI', () => {
    annotateLines(
      'Line 1: This is a line of code `var x = 5; var y = 6;`',
      observations
    );
    sinon.assert.calledWith(annotateLineStub, 2, 'This is a line of code');
  });

  it('should highlight a single line of code referenced by the AI', () => {
    // The AI tends to misreport the line number, so we shouldn't rely on it
    annotateLines(
      'Line 1: This is a line of code `var x = 5; var y = 6;`',
      observations
    );
    sinon.assert.calledWith(highlightLineStub, 2);
  });

  it('should highlight a truncated line of code referenced by the AI', () => {
    // The AI tends to misreport the line number, so we shouldn't rely on it
    annotateLines(
      'Line 1: This is a line of code `if (something) { ... }`',
      observations
    );
    sinon.assert.calledWith(highlightLineStub, 10);
  });

  it('should highlight all lines of code referenced by the AI', () => {
    annotateLines(
      'Line 1: This is a line of code `var x = 5; var y = 6;`',
      observations
    );
    sinon.assert.calledWith(highlightLineStub, 2);
    sinon.assert.calledWith(highlightLineStub, 3);
  });

  it('should just highlight the lines the AI thinks if the referenced code does not exist', () => {
    annotateLines('Line 45: This is a line of code `var z = 0`', observations);
    sinon.assert.calledWith(annotateLineStub, 45, 'This is a line of code');
    sinon.assert.calledWith(highlightLineStub, 45);
  });

  it('should just highlight all of the lines the AI thinks if the referenced code does not exist', () => {
    annotateLines(
      'Line 42-44: This is a line of code `var z = 0`',
      observations
    );
    sinon.assert.calledWith(annotateLineStub, 42, 'This is a line of code');
    sinon.assert.calledWith(highlightLineStub, 42);
    sinon.assert.calledWith(highlightLineStub, 43);
    sinon.assert.calledWith(highlightLineStub, 44);
  });

  it('should annotate the last line of code when referenced by the AI', () => {
    annotateLines('Line 55: This is a line of code `draw();`', observations);
    sinon.assert.calledWith(annotateLineStub, 8, 'This is a line of code');
  });

  it('should pass along the correct info type for the annotation', () => {
    annotateLines('Line 55: This is a line of code `draw();`', observations);
    sinon.assert.calledWith(
      annotateLineStub,
      sinon.match.any,
      sinon.match.any,
      'INFO'
    );
  });

  it('should pass along a hex color', () => {
    annotateLines('Line 55: This is a line of code `draw();`', observations);
    sinon.assert.calledWith(
      annotateLineStub,
      sinon.match.any,
      sinon.match.any,
      sinon.match.any,
      sinon.match('#')
    );
  });

  it('should pass along the appropriate image as an icon', () => {
    annotateLines('Line 55: This is a line of code `draw();`', observations);

    sinon.assert.calledWith(
      annotateLineStub,
      sinon.match.any,
      sinon.match.any,
      sinon.match.any,
      sinon.match('#'),
      infoIconImage
    );
  });

  it('should pass along the appropriate image as an icon for the tooltip', () => {
    annotateLines('Line 55: This is a line of code `draw();`', observations);

    sinon.assert.calledWith(
      annotateLineStub,
      sinon.match.any,
      sinon.match.any,
      sinon.match.any,
      sinon.match.any,
      sinon.match.any,
      sinon.match({backgroundImage: sinon.match(`${tipIconImage}`)})
    );
  });

  it('should highlight the last line of code when referenced by the AI', () => {
    annotateLines('Line 55: This is a line of code `draw();`', observations);
    sinon.assert.calledWith(highlightLineStub, 8);
  });

  it('should highlight the line with a hex color', () => {
    annotateLines('Line 55: This is a line of code `draw();`', observations);
    sinon.assert.calledWith(highlightLineStub, 8, sinon.match('#'));
  });

  it('should use the provided line numbers if the code snippet is empty', () => {
    annotateLines('Line 42: This is totally a thing ` `', observations);
    sinon.assert.calledWith(annotateLineStub, 42, 'This is totally a thing');
  });

  it('should use the provided line numbers if the code snippet is missing', () => {
    annotateLines(
      'Line 42: This is totally a thing Lines 45-56: This is also a thing `some code`',
      observations
    );
    sinon.assert.calledWith(annotateLineStub, 42, 'This is totally a thing');
  });

  it('should annotate with the observations if the evidence has no message.', () => {
    annotateLines('Line 42: `draw()`', observations);
    sinon.assert.calledWith(annotateLineStub, 8, observations);
  });

  it('should return the parsed observations when the evidence is blank.', () => {
    const annotations = annotateLines('', observations);

    // One for each sentence
    deprecatedExpect(annotations.length).to.be.equal(2);

    // The lines are undefined for the written annotation since we don't know
    // if it is relevant.
    deprecatedExpect(annotations[0].firstLine).to.be.undefined;

    // And they are in the order provided by the given observations string.
    deprecatedExpect(annotations[0].message).to.be.equal(
      observations.split('.')[0]
    );
  });

  it('should return the set of sentences reflected in observations if the evidence has no message.', () => {
    const annotations = annotateLines('Line 42: `draw()`', observations);

    // One for each sentence
    deprecatedExpect(annotations.length).to.be.equal(2);

    // The lines are undefined for the written annotation since we don't know
    // if it is relevant.
    deprecatedExpect(annotations[0].firstLine).to.be.undefined;

    // And they are in the order provided by the given observations string.
    deprecatedExpect(annotations[0].message).to.be.equal(
      observations.split('.')[0]
    );
  });
});

describe('clearAnnotations', () => {
  let clearAnnotationsStub, clearHighlightedLinesStub;

  beforeEach(() => {
    clearAnnotationsStub = sinon.stub(EditorAnnotator, 'clearAnnotations');
    clearHighlightedLinesStub = sinon.stub(
      EditorAnnotator,
      'clearHighlightedLines'
    );
  });

  afterEach(() => {
    clearAnnotationsStub.restore();
    clearHighlightedLinesStub.restore();
  });

  it('should clear annotations and clear highlighted lines', () => {
    clearAnnotations();
    sinon.assert.called(clearAnnotationsStub);
    sinon.assert.called(clearHighlightedLinesStub);
  });
});
