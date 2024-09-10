import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import annotationList from '@cdo/apps/acemode/annotationList';
import EditorAnnotator, {DropletAnnotator} from '@cdo/apps/EditorAnnotator';
import {
  singleton as studioApp,
  stubStudioApp,
  restoreStudioApp,
} from '@cdo/apps/StudioApp';

import {expect} from '../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('EditorAnnotator', () => {
  let patchStub;
  let oldEditor, aceSessionStub, aceSessionDocumentStub;
  let dropletStub, dropletSessionStub;

  const stubDroplet = () => {
    dropletStub = sinon.stub();
    oldEditor = studioApp().editor;
    studioApp().editor = dropletStub;

    dropletStub.aceEditor = sinon.stub();
    dropletStub.getValue = sinon.stub();

    // Stub out the editor session instance
    aceSessionStub = sinon.stub();
    aceSessionDocumentStub = sinon.stub();
    aceSessionDocumentStub.getLength = sinon.stub().returns(24);
    aceSessionStub.getDocument = sinon.stub().returns(aceSessionDocumentStub);
    dropletStub.aceEditor.getSession = sinon.stub().returns(aceSessionStub);

    dropletSessionStub = sinon.stub();
    dropletStub.session = dropletSessionStub;

    dropletSessionStub.view = sinon.stub();
    dropletSessionStub.tree = sinon.stub();
  };

  const restoreDroplet = () => {
    studioApp().editor = oldEditor;
  };

  beforeEach(() => {
    EditorAnnotator.reset();
    stubStudioApp();

    // And do not allow patching
    patchStub = sinon.stub(DropletAnnotator.prototype, 'patch').returns(true);

    // Stub out the app reference to the editor
    stubDroplet();
  });
  afterEach(() => {
    patchStub.restore();
    restoreDroplet();
    restoreStudioApp();
    EditorAnnotator.reset();
  });

  describe('annotateLine', () => {
    let annotationListStub, annotationListAttachStub;

    beforeEach(() => {
      annotationListStub = sinon.stub(annotationList, 'addRuntimeAnnotation');
      annotationListAttachStub = sinon.stub(annotationList, 'attachToSession');
    });
    afterEach(() => {
      annotationListAttachStub.restore();
      annotationListStub.restore();
    });

    it('should add the given annotation to the annotation list', () => {
      let message = 'This is a line of code';
      EditorAnnotator.annotateLine(4, message, 'INFO');
      sinon.assert.calledWith(annotationListStub, 'INFO', 4, message);
    });

    it('should amend the styling for the annotation when given a color', () => {
      let message = 'This is a line of code';
      EditorAnnotator.annotateLine(6, message, 'INFO', '#d24');

      // Detect that the <head> contains some styling including our color
      expect(document.head.innerHTML.includes('#d24')).to.be.true;
    });

    it('should amend the styling for the annotation when given an icon URL', () => {
      let message = 'This is a line of code';
      EditorAnnotator.annotateLine(2, message, 'INFO', null, '/my/image.png');

      // Detect that the <head> contains some styling including our color
      expect(document.head.innerHTML.includes('url(/my/image.png)')).to.be.true;
    });

    it('should amend the styling for the annotation when given an icon URL and a color', () => {
      let message = 'This is a line of code';
      EditorAnnotator.annotateLine(2, message, 'INFO', '#f99', '/my/image.png');

      // Detect that the <head> contains some styling including our color
      expect(document.head.innerHTML.includes('url(/my/image.png), #f99')).to.be
        .true;
    });

    /**
     * This test can only be executed in a browser environment
     */
    it.skip('should amend the styling for the tooltip element for an annotation when given', async () => {
      let message = 'This is a line of code';

      // Mock out the Ace Editor DOM presence
      const aceContainer = document.createElement('div');
      document.body.appendChild(aceContainer);
      dropletStub.aceEditor.container = aceContainer;

      EditorAnnotator.annotateLine(
        2,
        message,
        'INFO',
        '#f99',
        '/my/image.png',
        {backgroundImage: 'url(/my/bg.png)'}
      );

      // Simulate Ace Editor adding a tooltip
      const tooltip = document.createElement('div');
      tooltip.classList.add('ace_tooltip');
      tooltip.textContent = message;
      aceContainer.appendChild(tooltip);

      // Detect that this tooltip element has the styling requested
      // We need to make sure we go after any callbacks
      // And we need to match any 'corrected' form. For instance, it is
      // correct to put quotes in the resulting backgroundImage.
      await new Promise(process.nextTick);
      expect(tooltip.style.backgroundImage).to.match(
        /url\(["]?\/my\/bg.png["]\)/
      );

      // Clean-up
      aceContainer.remove();
    });

    it('should leave the styling for any unrelated tooltip elements', async () => {
      let message = 'This is a line of code';

      // Mock out the Ace Editor DOM presence
      const aceContainer = document.createElement('div');
      document.body.appendChild(aceContainer);
      dropletStub.aceEditor.container = aceContainer;

      EditorAnnotator.annotateLine(
        2,
        message,
        'INFO',
        '#f99',
        '/my/image.png',
        {backgroundImage: 'url(/my/bg.png)'}
      );

      // Simulate Ace Editor adding a tooltip
      const tooltip = document.createElement('div');
      tooltip.classList.add('ace_tooltip');
      tooltip.textContent = 'some other message!';
      aceContainer.appendChild(tooltip);

      // Similar to above, but we shouldn't match because the text of this tooltip
      // does not match the annotation we added.
      await new Promise(process.nextTick);
      expect(tooltip.style.backgroundImage).to.not.match(
        /url\(["]?\/my\/bg.png["]\)/
      );

      // Clean-up
      aceContainer.remove();
    });
  });

  describe('clearAnnotations', () => {
    let annotationListFilterStub, annotationListAttachStub;
    beforeEach(() => {
      annotationListFilterStub = sinon.stub(
        annotationList,
        'filterOutRuntimeAnnotations'
      );
      annotationListAttachStub = sinon.stub(annotationList, 'attachToSession');
    });
    afterEach(() => {
      annotationListAttachStub.restore();
      annotationListFilterStub.restore();
    });

    it('should tell the annotation list to filter out by the given log type', () => {
      EditorAnnotator.clearAnnotations('ERROR');
      sinon.assert.calledWith(annotationListFilterStub, 'ERROR');
    });
  });

  describe('findCodeRegion', () => {
    const code = `// code
      var x = 5;
      var y = 6;
      // add them together
      /*
      var z = x + y;
      */
      draw();
    `;

    beforeEach(() => {
      dropletStub.getValue = sinon.stub().returns(code);
    });

    it('returns undefined for both lines when the snippet is not found', () => {
      let snippet = 'var a = 0;';
      const result = EditorAnnotator.findCodeRegion(snippet);
      expect(result.firstLine).to.be.undefined;
      expect(result.lastLine).to.be.undefined;
    });

    it('returns undefined for both lines when the snippet is empty', () => {
      let snippet = '';
      const result = EditorAnnotator.findCodeRegion(snippet);
      expect(result.firstLine).to.be.undefined;
      expect(result.lastLine).to.be.undefined;
    });

    it('returns undefined for both lines when the snippet is just whitespace', () => {
      let snippet = ' \n ';
      const result = EditorAnnotator.findCodeRegion(snippet);
      expect(result.firstLine).to.be.undefined;
      expect(result.lastLine).to.be.undefined;
    });

    it('returns the proper line when the snippet is found', () => {
      let snippet = 'var y = 6;';
      const result = EditorAnnotator.findCodeRegion(snippet);
      expect(result.firstLine).to.equal(3);
      expect(result.lastLine).to.equal(3);
    });

    it('returns the proper lines when the multiline snippet is found', () => {
      let snippet = 'var x = 5; var y = 6;';
      const result = EditorAnnotator.findCodeRegion(snippet);
      expect(result.firstLine).to.equal(2);
      expect(result.lastLine).to.equal(3);
    });

    it('returns the proper lines when the snippet is the last line', () => {
      let snippet = 'draw();';
      const result = EditorAnnotator.findCodeRegion(snippet);
      expect(result.firstLine).to.equal(8);
      expect(result.lastLine).to.equal(8);
    });
  });

  describe('getCode', () => {
    const code = `// code
      var x = 5;
      var y = 6;
      // add them together
      /*
      var z = x + y;
      */
      draw();
    `;

    beforeEach(() => {
      dropletStub.getValue = sinon.stub().returns(code);
    });

    it('returns the code from the editor', () => {
      const result = EditorAnnotator.getCode();
      expect(result).to.equal(code);
    });

    describe('options.stripComments: true', () => {
      it('returns a result of the same length as the input', () => {
        const result = EditorAnnotator.getCode({
          stripComments: true,
        });
        expect(result.length).to.equal(code.length);
      });

      it('returns a result that does not contain the comments', () => {
        const result = EditorAnnotator.getCode({
          stripComments: true,
        });
        expect(result).to.not.have.string('// add them together');
        expect(result).to.not.have.string('var z = x + y');
        expect(result).to.not.have.string('// code');
      });

      it('returns a result that does still contain the code', () => {
        const result = EditorAnnotator.getCode({
          stripComments: true,
        });
        expect(result).to.have.string('var x = 5');
        expect(result).to.have.string('var y = 6');
      });
    });
  });

  describe('highlightLine', () => {
    let rangeStub;
    let getBlocksOnLineStub;
    let dimBlocksStub, undimBlockStub, undimBlocksStub;
    let blocks = [];

    beforeEach(() => {
      // Stub out the editor session instance
      aceSessionStub.addMarker = sinon.stub();
      aceSessionStub.removeMarker = sinon.stub();

      // All lines are 42 characters long
      aceSessionStub.getLine = sinon.stub().returns('x'.repeat(42));

      // Stub out the ace editor itself and the Range class
      rangeStub = sinon.stub();

      window.ace = {
        require: sinon.stub().withArgs('ace/range').returns({
          Range: rangeStub,
        }),
      };

      // Stub out getBlocksOnLine
      getBlocksOnLineStub = sinon
        .stub(EditorAnnotator, 'getBlocksForLine')
        .returns(blocks);
      dimBlocksStub = sinon.stub(EditorAnnotator, 'dimBlocks').returns();
      undimBlockStub = sinon.stub(EditorAnnotator, 'undimBlock').returns();
      undimBlocksStub = sinon.stub(EditorAnnotator, 'undimBlocks').returns();
    });
    afterEach(() => {
      getBlocksOnLineStub.restore();
      dimBlocksStub.restore();
      undimBlockStub.restore();
      undimBlocksStub.restore();
    });

    it('should mark the given line in the editor', () => {
      EditorAnnotator.highlightLine(4);
      // It should create just one range with the (0-based) line index we
      // passed it. The 42 is the length of the line which is stubbed out.
      sinon.assert.calledOnceWithExactly(rangeStub, 3, 0, 3, 42);
      sinon.assert.calledWithNew(rangeStub);
      sinon.assert.calledWith(
        aceSessionStub.addMarker,
        sinon.match.instanceOf(rangeStub),
        sinon.match.any,
        'text'
      );

      // Hopefully this function clears the state
      EditorAnnotator.clearHighlightedLines();
    });

    it('should dim blocks when possible', () => {
      EditorAnnotator.highlightLine(4);

      sinon.assert.calledOnce(dimBlocksStub);

      // Hopefully this function clears the state
      EditorAnnotator.clearHighlightedLines();
    });

    it('should only dim blocks the first time when called more than once', () => {
      EditorAnnotator.highlightLine(4);
      EditorAnnotator.highlightLine(5);

      sinon.assert.calledOnce(dimBlocksStub);

      // Hopefully this function clears the state
      EditorAnnotator.clearHighlightedLines();
    });

    it('should undim the blocks for the highlighted line', () => {
      // Ensure that these stubbed blocks are part of the highlighted line
      blocks.push(sinon.stub());
      blocks.push(sinon.stub());

      EditorAnnotator.highlightLine(4);

      // It should call undimBlock on each of them
      expect(undimBlockStub.callCount).to.equal(blocks.length);
      for (const block of blocks) {
        sinon.assert.calledWith(undimBlockStub, block);
      }

      // Hopefully this function clears the state
      EditorAnnotator.clearHighlightedLines();
    });

    it('should add a stylesheet for the given color', () => {
      EditorAnnotator.highlightLine(4, '#042');

      // It should create just one range with the (0-based) line index we
      // passed it. The 42 is the length of the line which is stubbed out.
      sinon.assert.calledWith(
        aceSessionStub.addMarker,
        sinon.match.instanceOf(rangeStub),
        sinon.match.any,
        'text'
      );

      // Detect that the <head> contains some styling including our color
      expect(document.head.innerHTML.includes('#042')).to.be.true;

      // Hopefully this function clears the state
      EditorAnnotator.clearHighlightedLines();
    });
  });

  describe('clearHighlightedLines', () => {
    let getBlocksOnLineStub;
    let dimBlocksStub, undimBlockStub, undimBlocksStub;

    beforeEach(() => {
      // We will call add marker, so we need to stub it out too
      aceSessionStub.addMarker = sinon.stub();
      aceSessionStub.removeMarker = sinon.stub();

      // All lines are 42 characters long
      aceSessionStub.getLine = sinon.stub().returns('x'.repeat(42));

      // Stub out 'highlightLine's use of ace.Range
      window.ace = {
        require: sinon.stub().withArgs('ace/range').returns({
          Range: sinon.stub(),
        }),
      };

      getBlocksOnLineStub = sinon
        .stub(EditorAnnotator, 'getBlocksForLine')
        .returns([sinon.stub()]);
      dimBlocksStub = sinon.stub(EditorAnnotator, 'dimBlocks').returns();
      undimBlockStub = sinon.stub(EditorAnnotator, 'undimBlock').returns();
      undimBlocksStub = sinon.stub(EditorAnnotator, 'undimBlocks').returns();
    });
    afterEach(() => {
      getBlocksOnLineStub.restore();
      dimBlocksStub.restore();
      undimBlockStub.restore();
      undimBlocksStub.restore();
    });

    it('should remove each highlighted line previously highlighted', () => {
      // Highlight lines with a variety of classes
      EditorAnnotator.highlightLine(4);
      EditorAnnotator.highlightLine(5);
      EditorAnnotator.highlightLine(6, '#ff0');
      EditorAnnotator.clearHighlightedLines();

      // Should call the removeMarker as many times as we called highlightLine
      expect(aceSessionStub.removeMarker.callCount).to.equal(3);
    });

    it('should undim all blocks', () => {
      EditorAnnotator.highlightLine(4);
      EditorAnnotator.highlightLine(5);
      EditorAnnotator.highlightLine(6, '#ff0');
      EditorAnnotator.clearHighlightedLines();

      sinon.assert.calledOnce(undimBlocksStub);
    });
  });

  describe('scrollToLine', () => {
    let scrollToLineStub;

    beforeEach(() => {
      scrollToLineStub = dropletStub.aceEditor.scrollToLine = sinon.stub();
    });

    it('should wrap and call the necessary method in Ace', () => {
      EditorAnnotator.scrollToLine(42);
      sinon.assert.calledOnceWithExactly(scrollToLineStub, 42, true, true);
    });
  });
});
