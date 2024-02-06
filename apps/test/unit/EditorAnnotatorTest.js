import sinon from 'sinon';
import EditorAnnotator from '@cdo/apps/EditorAnnotator';
import {expect} from '../util/reconfiguredChai';
import {
  singleton as studioApp,
  stubStudioApp,
  restoreStudioApp,
} from '@cdo/apps/StudioApp';
import annotationList from '@cdo/apps/acemode/annotationList';

describe('EditorAnnotator', () => {
  let editorAnnotator;

  beforeEach(() => {
    stubStudioApp();
    editorAnnotator = new EditorAnnotator(studioApp());
  });
  afterEach(restoreStudioApp);

  describe('annotateLine', () => {
    let annotationListStub;
    beforeEach(() => {
      annotationListStub = sinon.stub(annotationList, 'addRuntimeAnnotation');
    });
    afterEach(() => {
      annotationListStub.restore();
    });

    it('should add the given annotation to the annotation list', () => {
      let message = 'This is a line of code';
      editorAnnotator.annotateLine(message, 4, 'INFO');
      sinon.assert.calledWith(annotationListStub, 'INFO', 4, message);
    });
  });

  describe('clearAnnotations', () => {
    let annotationListStub;
    beforeEach(() => {
      annotationListStub = sinon.stub(
        annotationList,
        'filterOutRuntimeAnnotations'
      );
    });
    afterEach(() => {
      annotationListStub.restore();
    });

    it('should tell the annotation list to filter out by the given log type', () => {
      editorAnnotator.clearAnnotations('ERROR');
      sinon.assert.calledWith(annotationListStub, 'ERROR');
    });
  });

  describe('highlightLine', () => {
    let oldEditor, sessionStub, rangeStub;

    beforeEach(() => {
      // Stub out the app reference to the editor
      oldEditor = studioApp().editor;
      studioApp().editor = {
        aceEditor: sinon.stub(),
      };

      // Stub out the editor session instance
      sessionStub = sinon.stub();
      sessionStub.addMarker = sinon.stub();
      sessionStub.removeMarker = sinon.stub();

      // All lines are 42 characters long
      sessionStub.getLine = sinon.stub().returns('x'.repeat(42));
      studioApp().editor.aceEditor.getSession = sinon
        .stub()
        .returns(sessionStub);

      // Stub out the ace editor itself and the Range class
      rangeStub = sinon.stub();

      window.ace = {
        require: sinon.stub().withArgs('ace/range').returns({
          Range: rangeStub,
        }),
      };
    });
    afterEach(() => {
      studioApp().editor = oldEditor;
    });

    it('should mark the given line in the editor with the given class', () => {
      editorAnnotator.highlightLine(4, 'my_class');
      // It should create just one range with the (0-based) line index we
      // passed it. The 42 is the length of the line which is stubbed out.
      sinon.assert.calledOnceWithExactly(rangeStub, 3, 0, 3, 42);
      sinon.assert.calledWithNew(rangeStub);
      sinon.assert.calledWith(
        sessionStub.addMarker,
        sinon.match.instanceOf(rangeStub),
        'my_class',
        'text'
      );

      // Hopefully this function clears the state
      editorAnnotator.clearHighlightedLines();
    });
  });

  describe('clearHighlightedLines', () => {
    let oldEditor, sessionStub;

    beforeEach(() => {
      // Stub out the app reference to the editor
      oldEditor = studioApp().editor;
      studioApp().editor = {
        aceEditor: sinon.stub(),
      };

      // Stub out the editor session instance
      sessionStub = sinon.stub();

      // We will call add marker, so we need to stub it out too
      sessionStub.addMarker = sinon.stub();
      sessionStub.removeMarker = sinon.stub();

      // All lines are 42 characters long
      sessionStub.getLine = sinon.stub().returns('x'.repeat(42));

      studioApp().editor.aceEditor.getSession = sinon
        .stub()
        .returns(sessionStub);

      // Stub out 'highlightLine's use of ace.Range
      window.ace = {
        require: sinon.stub().withArgs('ace/range').returns({
          Range: sinon.stub(),
        }),
      };
    });
    afterEach(() => {
      studioApp().editor = oldEditor;
    });

    it('should remove each highlighted line previously highlighted', () => {
      // Highlight lines with a variety of classes
      editorAnnotator.highlightLine(4);
      editorAnnotator.highlightLine(5, 'my_class');
      editorAnnotator.highlightLine(6, 'my_other_class');
      editorAnnotator.clearHighlightedLines();

      // Should call the removeMarker as many times as we called highlightLine
      expect(sessionStub.removeMarker.callCount).to.equal(3);
    });
  });
});
