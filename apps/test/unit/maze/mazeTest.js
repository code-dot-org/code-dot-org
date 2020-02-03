import sinon from 'sinon';

import {expect} from '../../util/deprecatedChai';

import Maze from '@cdo/apps/maze/maze';
import ResultsHandler from '@cdo/apps/maze/results/resultsHandler';
import {MazeController} from '@code-dot-org/maze';

describe('Maze', function() {
  let maze;
  let clock;

  beforeEach(function() {
    clock = sinon.useFakeTimers();
    maze = new Maze();
    maze.controller = new MazeController(
      {
        map: [[]]
      },
      {
        movePegmanAnimationSpeedScale: 1
      },
      {
        level: {}
      }
    );
    maze.resultsHandler = new ResultsHandler(maze.controller, {});
    maze.prepareForExecution_();
  });

  afterEach(function() {
    clock.restore();
  });

  describe('animation queue', function() {
    let animateActionSpy;
    let finishAnimationsSpy;
    let getActionsSpy;

    beforeEach(function() {
      animateActionSpy = sinon.stub(maze, 'animateAction_');
      finishAnimationsSpy = sinon.stub(maze, 'finishAnimations_');
      getActionsSpy = sinon.stub(maze.executionInfo, 'getActions');
      getActionsSpy.returns(new Array(2));
    });

    afterEach(function() {
      animateActionSpy.restore();
      finishAnimationsSpy.restore();
      getActionsSpy.restore();
    });

    it('is initiated by scheduleAnimations', function() {
      maze.scheduleAnimations_(false);
      expect(finishAnimationsSpy.called).to.be.false;
      clock.tick(999);
      expect(finishAnimationsSpy.called).to.be.false;
      clock.tick(1);
      expect(finishAnimationsSpy.called).to.be.true;
    });

    it('can be rate-adjusted', function() {
      const scheduleSingleAnimationSpy = sinon.stub(
        maze,
        'scheduleSingleAnimation_'
      );

      expect(finishAnimationsSpy.called).to.be.false;

      expect(maze.stepSpeed).to.equal(100);
      expect(maze.scale.stepSpeed).to.equal(5);
      expect(maze.controller.skin.movePegmanAnimationSpeedScale).to.equal(1);

      maze.scheduleAnimations_(false);
      expect(
        scheduleSingleAnimationSpy.withArgs(0, new Array(2), false, 500)
          .calledOnce
      ).to.be.true;

      maze.stepSpeed = 200;
      maze.scheduleAnimations_(false);
      expect(
        scheduleSingleAnimationSpy.withArgs(0, new Array(2), false, 1000)
          .calledOnce
      ).to.be.true;

      maze.scale.stepSpeed = 1;
      maze.scheduleAnimations_(false);
      expect(
        scheduleSingleAnimationSpy.withArgs(0, new Array(2), false, 200)
          .calledOnce
      ).to.be.true;

      scheduleSingleAnimationSpy.restore();
    });

    it('can be canceled by a reset', function() {
      const controllerResetSpy = sinon.stub(maze.controller, 'reset');

      maze.scheduleAnimations_(false);
      expect(finishAnimationsSpy.called).to.be.false;
      maze.reset_();
      clock.tick(1000);
      expect(finishAnimationsSpy.called).to.be.false;

      controllerResetSpy.restore();
    });
  });
});
