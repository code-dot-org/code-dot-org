import {MazeController} from '@code-dot-org/maze';

import Maze from '@cdo/apps/maze/maze';
import ResultsHandler from '@cdo/apps/maze/results/resultsHandler';

describe('Maze', function () {
  let maze;

  beforeEach(function () {
    jest.useFakeTimers();
    maze = new Maze();
    maze.controller = new MazeController(
      {
        map: [[]],
      },
      {
        movePegmanAnimationSpeedScale: 1,
      },
      {
        level: {},
      }
    );
    maze.resultsHandler = new ResultsHandler(maze.controller, {});
    maze.prepareForExecution_();
  });

  afterEach(function () {
    jest.useRealTimers();
  });

  describe('animation queue', function () {
    let animateActionSpy;
    let finishAnimationsSpy;
    let getActionsSpy;

    beforeEach(function () {
      animateActionSpy = jest
        .spyOn(maze, 'animateAction_')
        .mockClear()
        .mockImplementation();
      finishAnimationsSpy = jest
        .spyOn(maze, 'finishAnimations_')
        .mockClear()
        .mockImplementation();
      getActionsSpy = jest
        .spyOn(maze.executionInfo, 'getActions')
        .mockClear()
        .mockImplementation();
      getActionsSpy.mockReturnValue(new Array(2));
    });

    afterEach(function () {
      animateActionSpy.mockRestore();
      finishAnimationsSpy.mockRestore();
      getActionsSpy.mockRestore();
    });

    it('is initiated by scheduleAnimations', function () {
      maze.scheduleAnimations_(false);
      expect(finishAnimationsSpy).not.toHaveBeenCalled();
      jest.advanceTimersByTime(999);
      expect(finishAnimationsSpy).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(finishAnimationsSpy).toHaveBeenCalled();
    });

    it('can be rate-adjusted', function () {
      const scheduleSingleAnimationSpy = jest
        .spyOn(maze, 'scheduleSingleAnimation_')
        .mockClear()
        .mockImplementation();

      expect(finishAnimationsSpy).not.toHaveBeenCalled();

      expect(maze.stepSpeed).toBe(100);
      expect(maze.scale.stepSpeed).toBe(5);
      expect(maze.controller.skin.movePegmanAnimationSpeedScale).toBe(1);

      maze.scheduleAnimations_(false);
      expect(scheduleSingleAnimationSpy).toHaveBeenCalledWith(
        0,
        new Array(2),
        false,
        500
      );

      maze.stepSpeed = 200;
      maze.scheduleAnimations_(false);
      expect(scheduleSingleAnimationSpy).toHaveBeenCalledWith(
        0,
        new Array(2),
        false,
        1000
      );

      maze.scale.stepSpeed = 1;
      maze.scheduleAnimations_(false);
      expect(scheduleSingleAnimationSpy).toHaveBeenCalledWith(
        0,
        new Array(2),
        false,
        200
      );

      scheduleSingleAnimationSpy.mockRestore();
    });

    it('can be canceled by a reset', function () {
      const controllerResetSpy = jest
        .spyOn(maze.controller, 'reset')
        .mockClear()
        .mockImplementation();

      maze.scheduleAnimations_(false);
      expect(finishAnimationsSpy).not.toHaveBeenCalled();
      maze.reset_();
      jest.advanceTimersByTime(1000);
      expect(finishAnimationsSpy).not.toHaveBeenCalled();

      controllerResetSpy.mockRestore();
    });
  });
});
