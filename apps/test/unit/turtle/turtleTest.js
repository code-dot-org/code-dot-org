import {DEFAULT_EXECUTION_INFO} from '@cdo/apps/code-studio/jsinterpreter/CustomMarshalingInterpreter';
import {Position} from '@cdo/apps/constants';
import {stubRedux, restoreRedux, registerReducers} from '@cdo/apps/redux';
import pageConstants from '@cdo/apps/redux/pageConstants';
import {singleton as studioAppSingleton} from '@cdo/apps/StudioApp';
import Artist from '@cdo/apps/turtle/artist';
import {parseElement} from '@cdo/apps/xml';

const SHORT_DIAGONAL = 50 * Math.sqrt(2);
const VERY_LONG_DIAGONAL = 150 * Math.sqrt(2);

describe('Artist', () => {
  beforeEach(() => {
    stubRedux();
    registerReducers({pageConstants});
  });

  afterEach(() => {
    restoreRedux();
  });

  describe('drawing with joints', () => {
    var joints, segments, artist;
    beforeEach(() => {
      artist = new Artist();
      artist.visualization = new Artist.Visualization();
      joints = 0;
      segments = [];
      artist.visualization.drawJointAtTurtle_ = () => {
        joints += 1;
      };
      artist.visualization.drawForwardLine_ = dist => {
        segments.push(dist);
      };
    });
    it('draws 2 joints on a short segment', () => {
      artist.visualization.drawForwardWithJoints_(50, false);

      expect(joints).toBe(2);
      expect(segments).toEqual([50]);
    });
    it('draws 3 joints on a long segment', () => {
      artist.visualization.drawForwardWithJoints_(100, false);

      expect(joints).toBe(3);
      expect(segments).toEqual([50, 50]);
    });
    it('draws no joints on a very short segment', () => {
      artist.visualization.drawForwardWithJoints_(10, false);

      expect(joints).toBe(0);
      expect(segments).toEqual([10]);
    });
    it('draws 2 joints on a short diagonal segment', () => {
      artist.visualization.drawForwardWithJoints_(SHORT_DIAGONAL, true);

      expect(joints).toBe(2);
      expect(segments).toEqual([SHORT_DIAGONAL]);
    });
    it('draws 4 joints on a very long diagonal segment', () => {
      artist.visualization.drawForwardWithJoints_(VERY_LONG_DIAGONAL, true);

      expect(joints).toBe(4);
      expect(segments).toEqual([
        SHORT_DIAGONAL,
        SHORT_DIAGONAL,
        SHORT_DIAGONAL,
      ]);
    });
    it('draws no joints on a very short diagonal segment', () => {
      artist.visualization.drawForwardWithJoints_(SHORT_DIAGONAL - 1, true);

      expect(joints).toBe(0);
      expect(segments).toEqual([SHORT_DIAGONAL - 1]);
    });
  });

  describe('drawing with patterns', () => {
    it('draws a pattern backwards', () => {
      let artist = new Artist();
      let width = 100;
      let height = 100;
      let img = new Image(width, height);

      artist.visualization = new Artist.Visualization();
      artist.visualization.currentPathPattern = img;
      const setDrawPatternBackwardSpy = jest
        .spyOn(artist.visualization.ctxScratch, 'drawImage')
        .mockClear();
      artist.visualization.drawForwardLineWithPattern_(-100);

      expect(setDrawPatternBackwardSpy).toHaveBeenCalledWith(
        img,
        100,
        0,
        -100,
        100,
        -25,
        -50,
        -50,
        100
      );

      setDrawPatternBackwardSpy.mockRestore();
    });

    it('draws a pattern forward', () => {
      let artist = new Artist();
      let width = 100;
      let height = 100;
      let img = new Image(width, height);

      artist.visualization = new Artist.Visualization();
      artist.visualization.currentPathPattern = img;
      const setDrawPatternForwardSpy = jest
        .spyOn(artist.visualization.ctxScratch, 'drawImage')
        .mockClear();
      artist.visualization.drawForwardLineWithPattern_(100);

      expect(setDrawPatternForwardSpy).toHaveBeenCalledWith(
        img,
        0,
        0,
        100,
        100,
        -25,
        -50,
        150,
        100
      );

      setDrawPatternForwardSpy.mockRestore();
    });
  });

  describe('Accepts a third argument parameter', () => {
    it('draws a sticker when size is null', () => {
      let artist = new Artist();
      const img = new Image(100, 100);
      let size = null;
      let blockId = 'block_id_4';
      let options = {smoothAnimate: false};

      artist.visualization = new Artist.Visualization();
      const setStickerSize = jest
        .spyOn(artist.visualization.ctxScratch, 'drawImage')
        .mockClear();
      artist.stickers = {Alien: img};
      artist.step('sticker', ['Alien', size, blockId], options);

      expect(setStickerSize).toHaveBeenCalledWith(
        img,
        0,
        0,
        100,
        100,
        -50,
        -100,
        100,
        100
      );

      setStickerSize.mockRestore();
    });
    it('draws a sticker when size is 0', () => {
      let artist = new Artist();
      const img = new Image(100, 100);
      let size = 0;
      let blockId = 'block_id_4';
      let options = {smoothAnimate: false};

      artist.visualization = new Artist.Visualization();
      const setStickerSize = jest
        .spyOn(artist.visualization.ctxScratch, 'drawImage')
        .mockClear();
      artist.stickers = {Alien: img};
      artist.step('sticker', ['Alien', size, blockId], options);

      expect(setStickerSize).toHaveBeenCalledWith(
        img,
        0,
        0,
        100,
        100,
        -0,
        -0,
        0,
        0
      );

      setStickerSize.mockRestore();
    });
    it('draws a sticker when size is 50 px', () => {
      let artist = new Artist();
      const img = new Image(100, 100);
      let size = 50;
      let blockId = 'block_id_4';
      let options = {smoothAnimate: false};

      artist.visualization = new Artist.Visualization();
      const setStickerSize = jest
        .spyOn(artist.visualization.ctxScratch, 'drawImage')
        .mockClear();
      artist.stickers = {Alien: img};
      artist.step('sticker', ['Alien', size, blockId], options);

      expect(setStickerSize).toHaveBeenCalledWith(
        img,
        0,
        0,
        100,
        100,
        -25,
        -50,
        50,
        50
      );

      setStickerSize.mockRestore();
    });
    it('draws a sticker when size is 200 px', () => {
      // Test condition when width < size && height < size
      let artist = new Artist();
      const img = new Image(100, 100);
      let size = 200;
      let blockId = 'block_id_4';
      let options = {smoothAnimate: false};

      artist.visualization = new Artist.Visualization();
      const setStickerSize = jest
        .spyOn(artist.visualization.ctxScratch, 'drawImage')
        .mockClear();
      artist.stickers = {Alien: img};
      artist.step('sticker', ['Alien', size, blockId], options);

      expect(setStickerSize).toHaveBeenCalledWith(
        img,
        0,
        0,
        100,
        100,
        -50,
        -100,
        100,
        100
      );

      setStickerSize.mockRestore();
    });
    it('draws a sticker when size is 30 px', () => {
      let artist = new Artist();
      // Test condition when width > height
      const img = new Image(100, 40);
      let size = 30;
      let blockId = 'block_id_4';
      let options = {smoothAnimate: false};

      artist.visualization = new Artist.Visualization();
      const setStickerSize = jest
        .spyOn(artist.visualization.ctxScratch, 'drawImage')
        .mockClear();
      artist.stickers = {Alien: img};
      artist.step('sticker', ['Alien', size, blockId], options);

      expect(setStickerSize).toHaveBeenCalledWith(
        img,
        0,
        0,
        100,
        40,
        -15,
        -12,
        30,
        12
      );

      setStickerSize.mockRestore();
    });
  });

  describe('pointTo', () => {
    let artist;
    beforeEach(() => {
      artist = new Artist();
      artist.visualization = new Artist.Visualization();
    });

    it('can point to a specific direction', () => {
      const absoluteDirection = [0, 30, 45, 60, 180, 270];
      const blockId = 'block_id_4';
      const pointToSpy = jest
        .spyOn(artist.visualization, 'pointTo')
        .mockClear();

      absoluteDirection.forEach(angle => {
        artist.step('PT', [angle, blockId]);
        expect(pointToSpy).toHaveBeenCalledWith(angle);
      });
      pointToSpy.mockRestore();
    });

    it('can point to a 50 degrees', () => {
      let angle = 50;
      let blockId = 'block_id_5';

      artist.visualization.angle = 50;
      artist.step('PT', [angle, blockId]);

      expect(artist.visualization.angle).toBe(angle);
    });

    it('should call setHeading', () => {
      let angle = 60;
      let blockId = 'block_id_8';

      const setHeadingStub = jest
        .spyOn(artist.visualization, 'setHeading')
        .mockClear()
        .mockImplementation();
      artist.step('PT', [angle, blockId]);

      expect(setHeadingStub).toHaveBeenCalledTimes(1);

      setHeadingStub.mockRestore();
    });
  });

  describe('jumpTo', () => {
    let artist;
    beforeEach(() => {
      artist = new Artist();
      artist.visualization = new Artist.Visualization();
    });

    it('can jump to coordinates', () => {
      const coords = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];

      coords.forEach(x => {
        coords.forEach(y => {
          artist.step('JT', [[x, y]]);
          expect(artist.visualization.x).toBe(x);
          expect(artist.visualization.y).toBe(y);
        });
      });
    });

    it('can jump to a position', () => {
      const expectations = {
        TOPLEFT: [0, 0],
        TOPCENTER: [200, 0],
        TOPRIGHT: [400, 0],
        MIDDLELEFT: [0, 200],
        MIDDLECENTER: [200, 200],
        MIDDLERIGHT: [400, 200],
        BOTTOMLEFT: [0, 400],
        BOTTOMCENTER: [200, 400],
        BOTTOMRIGHT: [400, 400],
      };

      Object.keys(expectations).forEach(position => {
        const [x, y] = expectations[position];
        artist.step('JT', [Position[position]]);
        expect(artist.visualization.x).toBe(x);
        expect(artist.visualization.y).toBe(y);
      });
    });
  });

  describe('autoArtist', () => {
    const studioApp = studioAppSingleton();

    it('executes upon reset', done => {
      const artist = new Artist();
      const execute = jest
        .spyOn(artist, 'execute')
        .mockClear()
        .mockImplementation();
      artist.injectStudioApp(studioApp);
      artist
        .init({
          skin: {},
          level: {
            autoRun: true,
          },
        })
        .then(done)
        .catch(() => done());

      artist.resetButtonClick();

      expect(execute).toHaveBeenCalled();
      execute.mockRestore();
    });

    it('executes upon code changes', done => {
      const artist = new Artist();
      const execute = jest
        .spyOn(Artist.prototype, 'execute')
        .mockClear()
        .mockImplementation();
      const container = document.createElement('div');
      container.id = 'artistContainer';
      document.body.appendChild(container);
      artist.injectStudioApp(studioApp);
      artist
        .init({
          skin: {},
          level: {
            autoRun: true,
          },
          containerId: 'artistContainer',
        })
        .then(done)
        .catch(() => done());
      studioApp.runChangeHandlers();

      expect(execute).toHaveBeenCalled();
      execute.mockRestore();
    });
  });

  describe('prepareForRemix', () => {
    let artist, newDom, oldXml;

    beforeEach(() => {
      artist = new Artist();
      artist.skin = {id: 'artist'};

      oldXml = `
        <block type="when_run">
          <next>
            <block type="draw_move" inline="true">
              <value name="VALUE">
                <block type="math_nubmer">
                  <title name="NUM">40</title>
                </block>
              </value>
            </block>
          </next>
        </block>`;
      newDom = undefined;
      window.Blockly = {
        Xml: {
          blockSpaceToDom() {
            return parseElement(oldXml);
          },
          domToText(dom) {
            return new XMLSerializer().serializeToString(dom);
          },
        },
        mainBlockSpace: {
          clear() {},
        },
        cdoUtils: {
          loadBlocksToWorkspace(blockspace, str) {
            newDom = parseElement(str);
          },
        },
      };
    });

    it('does nothing if the level specifies no start position or direction', () => {
      artist.level = {};
      artist.prepareForRemix();

      // loadBlocksToWorkspace should not have been called
      expect(newDom).toBeUndefined();
    });

    it('adds moveTo block if initialX is set', () => {
      artist.level = {
        initialX: 30,
      };
      artist.prepareForRemix();

      expect(
        newDom.querySelector('block[type="jump_to_xy"] title[name="XPOS"]')
          .firstChild.wholeText
      ).toBe('30');
    });

    it('adds moveTo block if initialX and initialY are set', () => {
      artist.level = {
        initialX: 30,
        initialY: 50,
      };
      artist.prepareForRemix();

      expect(
        newDom.querySelector('block[type="jump_to_xy"] title[name="XPOS"]')
          .firstChild.wholeText
      ).toBe('30');
      expect(
        newDom.querySelector('block[type="jump_to_xy"] title[name="YPOS"]')
          .firstChild.wholeText
      ).toBe('50');
    });

    it('adds a moveTo block with 200 for the y coordinate if initialY is not specified in the level', () => {
      artist.level = {
        initialX: 30,
      };
      artist.prepareForRemix();

      expect(
        newDom.querySelector('block[type="jump_to_xy"] title[name="YPOS"]')
          .firstChild.wholeText
      ).toBe('200');
    });

    it('adds moveTo and turn blocks if initialX and startDirection are set', () => {
      artist.level = {
        initialX: 30,
        startDirection: 45,
      };
      artist.prepareForRemix();

      expect(
        newDom.querySelector('block[type="jump_to_xy"] title[name="XPOS"]')
          .firstChild.wholeText
      ).toBe('30');
      expect(
        newDom.querySelector('block[type="draw_turn"] title[name="NUM"]')
          .firstChild.wholeText
      ).toBe('-45');
    });

    it('adds a whenRun block if none is present', () => {
      artist.level = {
        initialX: 30,
      };
      oldXml = '';

      artist.prepareForRemix();

      expect(newDom.querySelector('block[type="when_run"]')).toBeDefined();
    });
  });

  it('Does not alert for infinite loops', () => {
    const artist = new Artist();
    const alertStub = jest
      .spyOn(window, 'alert')
      .mockClear()
      .mockImplementation();

    artist.evalCode('while(true) executionInfo.checkTimeout();', {
      ...DEFAULT_EXECUTION_INFO,
      ticks: 10, // Declare an infinite loop after 10 ticks
    });

    expect(alertStub).not.toHaveBeenCalled();

    alertStub.mockRestore();
  });
});
