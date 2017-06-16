import sinon from 'sinon';
import {replaceOnWindow, restoreOnWindow} from '../../util/testUtils';
import {expect} from '../../util/configuredChai';
import * as codeStudioLevels from '@cdo/apps/code-studio/levels/codeStudioLevels';
import {SVG_NS} from '@cdo/apps/constants';
import Studio, {setSvgText, calculateBubblePosition} from '@cdo/apps/studio/studio';
import {singleton as StudioApp, stubStudioApp, restoreStudioApp} from '@cdo/apps/StudioApp';
import instructions from '@cdo/apps/redux/instructions';
import instructionsDialog from '@cdo/apps/redux/instructionsDialog';
import pageConstants from '@cdo/apps/redux/pageConstants';
import runState from '@cdo/apps/redux/runState';
import {registerReducers} from '@cdo/apps/redux';
import {load as loadSkin} from '@cdo/apps/studio/skins';
import {parseElement} from '@cdo/apps/xml';
import CustomMarshalingInterpreter from '@cdo/apps/lib/tools/jsinterpreter/CustomMarshalingInterpreter';

const STUDIO_WIDTH = 400;
const SPEECH_BUBBLE_H_OFFSET = 50;
const SPEECH_BUBBLE_SIDE_MARGIN = 10;
const DEFAULT_MAP = [
  [16, 0, 0, 16, 0, 0, 16, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [16, 0, 0, 16, 0, 0, 16, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [16, 0, 0, 16, 0, 0, 16, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [16, 0, 0, 16, 0, 0, 16, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

describe('studio', function () {

  before(() => {
    replaceOnWindow('appOptions', {});
  });

  after(() => {
    restoreOnWindow('appOptions');
  });


  describe('setSvgText', function () {
    let speechBubbleText;
    let opts;

    beforeEach(function () {
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
        fullHeight: 120,
      };
    });

    it('stays small for short strings', function () {
      const size = setSvgText(Object.assign({}, opts, {
        text: 'Hello world!',
      }));
      expect(size.height).to.be.below(50);
      expect(size.width).to.equal(150);
    });

    it('maxes out for long strings', function () {
      const size = setSvgText(Object.assign({}, opts, {
        text: 'We hold these truths to be self-evident, that all people are ' +
          'created equal, that they are endowed by their Creator with ' +
          'certain unalienable Rights, that among these are Life, Liberty ' +
          'and the pursuit of Happiness.',
      }));
      expect(size.height).to.equal(opts.fullHeight);
      expect(size.width).to.equal(opts.maxWidth);
    });

    it('increases width to less than maxWidth for medium strings', function () {
      const size = setSvgText(Object.assign({}, opts, {
        text: 'Arma virumque cano, Troiae qui primus ab oris' +
          'Italiam, fato profugus, Laviniaque venit' +
          'litora, multum ille et terris iactatus et alto',
      }));
      expect(size.width).to.be.above(opts.width);
      expect(size.width).to.be.below(opts.maxWidth);
    });
  });

  describe('calculateBubblePosition', function () {
    it('positions a small bubble on the top right', function () {
      const position = calculateBubblePosition({
          x: 150,
          y: 100,
          height: 50,
          width: 50,
        },
        40 /* bubbleHeight */,
        180 /* bubbleWidth */,
        STUDIO_WIDTH);

      expect(position.onTop).to.be.true;
      expect(position.onRight).to.be.true;
      expect(position.tipOffset).to.equal(0);
      expect(position.xSpeech).to.be.above(150);
      expect(position.ySpeech).to.be.below(100);
    });

    it('positions a small bubble on the top left', function () {
      const position = calculateBubblePosition({
        x: 300,
        y: 100,
        height: 50,
        width: 50,
      },
      40 /* bubbleHeight */,
      180 /* bubbleWidth */,
      STUDIO_WIDTH);

      expect(position.onTop).to.be.true;
      expect(position.onRight).to.be.false;
      expect(position.tipOffset).to.equal(0);
      expect(position.xSpeech).to.be.below(300);
      expect(position.ySpeech).to.be.below(100);
    });

    it('positions a small bubble on the botom right', function () {
      const position = calculateBubblePosition({
          x: 150,
          y: 0,
          height: 50,
          width: 50,
        },
        40 /* bubbleHeight */,
        180 /* bubbleWidth */,
        STUDIO_WIDTH);

      expect(position.onTop).to.be.false;
      expect(position.onRight).to.be.true;
      expect(position.tipOffset).to.equal(0);
      expect(position.xSpeech).to.be.above(150);
      expect(position.ySpeech).to.be.above(0);
    });

    it('positions a small bubble on the botom left', function () {
      const position = calculateBubblePosition({
          x: 250,
          y: 0,
          height: 50,
          width: 50,
        },
        40 /* bubbleHeight */,
        180 /* bubbleWidth */,
        STUDIO_WIDTH);

      expect(position.onTop).to.be.false;
      expect(position.onRight).to.be.false;
      expect(position.tipOffset).to.equal(0);
      expect(position.xSpeech).to.be.below(250);
      expect(position.ySpeech).to.be.above(0);
    });

    it('adjusts the bubble tip on a large bubble below to the right', function () {
      const sprite = {
        x: 0,
        y: 0,
        height: 50,
        width: 50,
      };
      const position = calculateBubblePosition(
        sprite,
        120 /* bubbleHeight */,
        380 /* bubbleWidth */,
        STUDIO_WIDTH);

      expect(SPEECH_BUBBLE_SIDE_MARGIN + position.tipOffset).to.equal(
          sprite.x + SPEECH_BUBBLE_H_OFFSET);
      expect(position.xSpeech).to.equal(10);
      expect(position.ySpeech).to.be.above(0);
    });

    it('adjusts the bubble tip on a large bubble above to the left', function () {
      const sprite = {
        x: 250,
        y: 250,
        height: 50,
        width: 50,
      };
      const position = calculateBubblePosition(
        sprite,
        120 /* bubbleHeight */,
        380 /* bubbleWidth */,
        STUDIO_WIDTH);

      expect(SPEECH_BUBBLE_SIDE_MARGIN + position.tipOffset).to.equal(
          STUDIO_WIDTH - sprite.width - sprite.x + SPEECH_BUBBLE_H_OFFSET);
      expect(position.xSpeech).to.equal(10);
      expect(position.ySpeech).to.be.below(250);
    });
  });

  describe('prepareForRemix', function () {
    let newXml, oldXml;
    const level = {
      map: DEFAULT_MAP,
      spritesHiddenToStart: true,
      firstSpriteIndex: 1,
    };

    before(function () {
      StudioApp().assetUrl = () => '';
      const container = document.createElement('div');
      container.setAttribute('id', 'container');
      document.body.appendChild(container);
      const background = document.createElement('div');
      background.setAttribute('id', 'background');
      document.body.appendChild(background);
      registerReducers({ pageConstants, instructions, instructionsDialog, runState });
      const skin = loadSkin(() => '', 'studio');
      const serializer = new XMLSerializer();
      replaceOnWindow('Blockly', {
        Xml: {
          blockSpaceToDom() {
            return parseElement(oldXml);
          },
          domToBlockSpace(blockspace, dom) {
            newXml = serializer.serializeToString(dom);
          },
          domToText() {
            return '';
          }
        },
        mainBlockSpace: {
          clear() {},
        },
        mainBlockSpaceEditor: {
          getToolboxWidth() {
            return 150;
          },
          addUnusedBlocksHelpListener() {},
          addChangeListener() {},
        },
        inject() {},
      });
      Studio.init({
        level: level,
        skin,
        containerId: 'container',
      });
    });

    beforeEach(function () {
      oldXml = `<xml>
          <block type="when_run">
            <next>
              <block type="studio_playSound"/>
            </next>
          </block>
        </xml>`;
      newXml = undefined;

      level.map = DEFAULT_MAP;
      level.spritesHiddenToStart = true;
      level.firstSpriteIndex = 1;
    });

    after(() => {
      restoreOnWindow('Blockly');
    });

    it('does nothing if everything matches defaults', function () {
      Studio.prepareForRemix();
      expect(newXml.replace(/\s*</g, '<')).to.equal(oldXml.replace(/\s*</g, '<'));
    });

    it('moves the first sprite if its position doesn\'t match the default', function () {
      level.map = [
        [0, 0, 0, 0, 0, 0, 0, 16],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ];
      Studio.loadLevel();

      Studio.prepareForRemix();

      const newDom = parseElement(newXml);
      expect(newDom.querySelector('block[type="studio_setSpriteXY"]')).to.not.be.null;
      expect(newDom.querySelector('value[name="XPOS"] title').textContent).to.equal('400');
      expect(newDom.querySelector('value[name="YPOS"] title').textContent).to.equal('50');

    });

    it('adds a setSprite block for a custom sprite if sprites are visible by default', function () {
      level.map = [
        [0, 0, 0, 0, 0, 0, 0, {tileType: 16, sprite: 5}],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ];
      level.spritesHiddenToStart = false;
      Studio.loadLevel();

      Studio.prepareForRemix();

      const newDom = parseElement(newXml);
      expect(newDom.querySelector('block[type="studio_setSpriteParams"]')).to.not.be.null;

      level.spritesHiddenToStart = true;
    });

    it('adds a when_run block if none exists', function () {
      level.allowSpritesOutsidePlayspace = true;
      Studio.loadLevel();
      oldXml = '';

      Studio.prepareForRemix();

      const newDom = parseElement(newXml);
      expect(newDom.querySelector('block[type="when_run"]')).to.not.be.null;

      level.allowSpritesOutsidePlayspace = undefined;
    });

    it('copies initialization blocks into the regular workspace', function () {
      level.initializationBlocks = `<xml>
          <block type="when_run">
            <next>
              <block type="studio_setBackground">
                <title name="VALUE">"cave"</title>
              </block>
            </next>
          </block>
        </xml>`;

      Studio.prepareForRemix();

      const newDom = parseElement(newXml);
      expect(newDom.querySelector('block[type="studio_playSound"]')).to.not.be.null;
      expect(newDom.querySelector('block[type="studio_setBackground"]')).to.not.be.null;

      level.initializationBlocks = undefined;
    });

    it('makes all blocks visible', function () {
      oldXml = `<xml>
          <block type="when_run" uservisible="false">
            <next>
              <block type="studio_setBackground">
                <title name="VALUE">"cave"</title>
              </block>
            </next>
          </block>
        </xml>`;

      Studio.prepareForRemix();
      const newDom = parseElement(newXml);
      expect(newDom.querySelector('block[type="when_run"]')
          .getAttribute('uservisible')).to.not.equal("false");
    });
  });

  describe('displayFeedback', () => {
    const containedLevelResult = {
      id: 6669,
      app: 'multi',
      callback: 'http://localhost-studio.code.org:3000/milestone/2023/16504/6669',
      result: {
        response: 1,
        result: true,
        errorType: null,
        submitted: false,
        valid: true
      },
      feedback: 'This is feedback'
    };
    let getContainedLevelResultStub;
    beforeEach(() => {
      stubStudioApp();
      getContainedLevelResultStub =
        sinon.stub(codeStudioLevels, 'getContainedLevelResult')
             .returns(containedLevelResult);
      StudioApp().onFeedback = () => {};
    });
    afterEach(() => {
      restoreStudioApp();
      getContainedLevelResultStub.restore();
    });

    it('does not override feedback icon for normal levels', () => {
      StudioApp().hasContainedLevels = false;
      const displayFeedbackSpy = sinon.spy(StudioApp(), 'displayFeedback');

      Studio.displayFeedback();

      expect(displayFeedbackSpy.getCall(0).args[0].showFailureIcon).to.be.false;
    });

    it('does not override feedback icon for correct answers to contained levels', () => {
      StudioApp().hasContainedLevels = true;
      const displayFeedbackSpy = sinon.spy(StudioApp(), 'displayFeedback');

      Studio.displayFeedback();

      expect(displayFeedbackSpy.getCall(0).args[0].showFailureIcon).to.be.false;
    });

    it('overrides feedback icon for incorrect answers to contained levels', () => {
      StudioApp().hasContainedLevels = true;
      const displayFeedbackSpy = sinon.spy(StudioApp(), 'displayFeedback');
      containedLevelResult.result.result = false;

      Studio.displayFeedback();

      expect(displayFeedbackSpy.getCall(0).args[0].showFailureIcon).to.be.true;
    });
  });

  describe("queueCallback method", () => {
    let cb, interpreterFunc, someHook;
    beforeEach(() => {
      const {hooks, interpreter} = CustomMarshalingInterpreter.evalWithEvents(
        {
          someGlobal: 1,
        }, {
          someHook: {code: 'return someGlobal;'},
        },
        'function someInterpreterFunc(a) { someGlobal = a; }'
      );
      someHook = hooks.find(hook => hook.name === 'someHook');
      Studio.interpreter = interpreter;
      Studio.eventHandlers = [];
      Studio.setLevel({});
      cb = sinon.spy();
      interpreterFunc = Studio.interpreter.createNativeFunction(Studio.interpreter.makeNativeMemberFunction({
        nativeFunc: cb,
      }));
    });

    it("will call the given interpreter callback function with the given parameters", () => {
      Studio.queueCallback(interpreterFunc, [1, 2, 3]);
      expect(cb).to.have.been.calledOnce;
      expect(cb).to.have.been.calledWith(1,2,3);
    });

    it("will not mess up any async functions that might be in the process of executing (regression test)", () => {
      expect(someHook.func()).to.equal(1);
      Studio.queueCallback(Studio.interpreter.getValueFromScope('someInterpreterFunc'), [5]);
      expect(someHook.func()).to.equal(5);
    });
  });
});
