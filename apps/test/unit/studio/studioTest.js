import {expect} from '../../util/configuredChai';
import {SVG_NS} from '@cdo/apps/constants';
import Studio, {setSvgText, calculateBubblePosition} from '@cdo/apps/studio/studio';
import {singleton as StudioApp} from '@cdo/apps/StudioApp';
import instructions from '@cdo/apps/redux/instructions';
import instructionsDialog from '@cdo/apps/redux/instructionsDialog';
import pageConstants from '@cdo/apps/redux/pageConstants';
import runState from '@cdo/apps/redux/runState';
import {registerReducers} from '@cdo/apps/redux';
import {load as loadSkin} from '@cdo/apps/studio/skins';
import {parseElement} from '@cdo/apps/xml';

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
    let newXml, oldXml, originalBlockly;
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
      originalBlockly = window.Blockly;
      window.Blockly = {
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
      };
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

    after(function () {
      window.Blockly = originalBlockly;
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
});
