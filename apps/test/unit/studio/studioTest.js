import sinon from 'sinon';
import {
  replaceOnWindow,
  restoreOnWindow,
  allowConsoleErrors
} from '../../util/testUtils';
import {expect} from '../../util/deprecatedChai';
import {SVG_NS} from '@cdo/apps/constants';
import Studio, {
  setSvgText,
  calculateBubblePosition
} from '@cdo/apps/studio/studio';
import CustomMarshalingInterpreter from '@cdo/apps/lib/tools/jsinterpreter/CustomMarshalingInterpreter';

const STUDIO_WIDTH = 400;
const SPEECH_BUBBLE_H_OFFSET = 50;
const SPEECH_BUBBLE_SIDE_MARGIN = 10;

describe('studio', function() {
  before(() => {
    replaceOnWindow('appOptions', {});
  });

  after(() => {
    restoreOnWindow('appOptions');
  });

  describe('setSvgText', function() {
    let speechBubbleText;
    let opts;

    beforeEach(function() {
      const svg = document.createElementNS(SVG_NS, 'svg');
      document.body.appendChild(svg);

      speechBubbleText = document.createElementNS(SVG_NS, 'text');
      svg.appendChild(speechBubbleText);

      opts = {
        svgText: speechBubbleText,
        width: 150,
        maxWidth: 300,
        lineHeight: 20,
        topMargin: 5,
        sideMargin: 10,
        maxLines: 5,
        fullHeight: 120
      };
    });

    it('stays small for short strings', function() {
      const size = setSvgText(
        Object.assign({}, opts, {
          text: 'Hello world!'
        })
      );
      expect(size.height).to.be.below(50);
      expect(size.width).to.equal(150);
    });

    it('maxes out for long strings', function() {
      const size = setSvgText(
        Object.assign({}, opts, {
          text:
            'We hold these truths to be self-evident, that all people are ' +
            'created equal, that they are endowed by their Creator with ' +
            'certain unalienable Rights, that among these are Life, Liberty ' +
            'and the pursuit of Happiness.'
        })
      );
      expect(size.height).to.equal(opts.fullHeight);
      expect(size.width).to.equal(opts.maxWidth);
    });

    it('increases width to less than maxWidth for medium strings', function() {
      const size = setSvgText(
        Object.assign({}, opts, {
          text:
            'Arma virumque cano, Troiae qui primus ab oris' +
            'Italiam, fato profugus, Laviniaque venit' +
            'litora, multum ille et terris iactatus et alto'
        })
      );
      expect(size.width).to.be.above(opts.width);
      expect(size.width).to.be.below(opts.maxWidth);
    });
  });

  describe('calculateBubblePosition', function() {
    it('positions a small bubble on the top right', function() {
      const position = calculateBubblePosition(
        {
          x: 150,
          y: 100,
          height: 50,
          width: 50
        },
        40 /* bubbleHeight */,
        180 /* bubbleWidth */,
        STUDIO_WIDTH
      );

      expect(position.onTop).to.be.true;
      expect(position.onRight).to.be.true;
      expect(position.tipOffset).to.equal(0);
      expect(position.xSpeech).to.be.above(150);
      expect(position.ySpeech).to.be.below(100);
    });

    it('positions a small bubble on the top left', function() {
      const position = calculateBubblePosition(
        {
          x: 300,
          y: 100,
          height: 50,
          width: 50
        },
        40 /* bubbleHeight */,
        180 /* bubbleWidth */,
        STUDIO_WIDTH
      );

      expect(position.onTop).to.be.true;
      expect(position.onRight).to.be.false;
      expect(position.tipOffset).to.equal(0);
      expect(position.xSpeech).to.be.below(300);
      expect(position.ySpeech).to.be.below(100);
    });

    it('positions a small bubble on the botom right', function() {
      const position = calculateBubblePosition(
        {
          x: 150,
          y: 0,
          height: 50,
          width: 50
        },
        40 /* bubbleHeight */,
        180 /* bubbleWidth */,
        STUDIO_WIDTH
      );

      expect(position.onTop).to.be.false;
      expect(position.onRight).to.be.true;
      expect(position.tipOffset).to.equal(0);
      expect(position.xSpeech).to.be.above(150);
      expect(position.ySpeech).to.be.above(0);
    });

    it('positions a small bubble on the botom left', function() {
      const position = calculateBubblePosition(
        {
          x: 250,
          y: 0,
          height: 50,
          width: 50
        },
        40 /* bubbleHeight */,
        180 /* bubbleWidth */,
        STUDIO_WIDTH
      );

      expect(position.onTop).to.be.false;
      expect(position.onRight).to.be.false;
      expect(position.tipOffset).to.equal(0);
      expect(position.xSpeech).to.be.below(250);
      expect(position.ySpeech).to.be.above(0);
    });

    it('adjusts the bubble tip on a large bubble below to the right', function() {
      const sprite = {
        x: 0,
        y: 0,
        height: 50,
        width: 50
      };
      const position = calculateBubblePosition(
        sprite,
        120 /* bubbleHeight */,
        380 /* bubbleWidth */,
        STUDIO_WIDTH
      );

      expect(SPEECH_BUBBLE_SIDE_MARGIN + position.tipOffset).to.equal(
        sprite.x + SPEECH_BUBBLE_H_OFFSET
      );
      expect(position.xSpeech).to.equal(10);
      expect(position.ySpeech).to.be.above(0);
    });

    it('adjusts the bubble tip on a large bubble above to the left', function() {
      const sprite = {
        x: 250,
        y: 250,
        height: 50,
        width: 50
      };
      const position = calculateBubblePosition(
        sprite,
        120 /* bubbleHeight */,
        380 /* bubbleWidth */,
        STUDIO_WIDTH
      );

      expect(SPEECH_BUBBLE_SIDE_MARGIN + position.tipOffset).to.equal(
        STUDIO_WIDTH - sprite.width - sprite.x + SPEECH_BUBBLE_H_OFFSET
      );
      expect(position.xSpeech).to.equal(10);
      expect(position.ySpeech).to.be.below(250);
    });
  });

  describe('queueCallback method', () => {
    allowConsoleErrors();

    let cb, interpreterFunc, someHook;
    beforeEach(() => {
      const {hooks, interpreter} = CustomMarshalingInterpreter.evalWithEvents(
        {
          someGlobal: 1
        },
        {
          someHook: {code: 'return someGlobal;'}
        },
        'function someInterpreterFunc(a) { someGlobal = a; }'
      );
      someHook = hooks.find(hook => hook.name === 'someHook');
      Studio.interpreter = interpreter;
      Studio.eventHandlers = [];
      Studio.setLevel({});
      cb = sinon.spy();
      interpreterFunc = Studio.interpreter.createNativeFunction(
        Studio.interpreter.makeNativeMemberFunction({
          nativeFunc: cb
        })
      );
    });

    it('will call the given interpreter callback function with the given parameters', () => {
      Studio.queueCallback(interpreterFunc, [1, 2, 3]);
      expect(cb).to.have.been.calledOnce;
      expect(cb).to.have.been.calledWith(1, 2, 3);
    });

    it('will not mess up any async functions that might be in the process of executing (regression test)', () => {
      expect(someHook.func()).to.equal(1);
      Studio.queueCallback(
        Studio.interpreter.getValueFromScope('someInterpreterFunc'),
        [5]
      );
      expect(someHook.func()).to.equal(5);
    });
  });
});
