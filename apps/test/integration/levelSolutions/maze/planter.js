import {TestResults} from '@cdo/apps/constants';
var PlanterHandler = require('@cdo/apps/maze/results/planter');

var levelDef = {
  'startDirection': 1, // Direction.EAST,
  'serializedMaze': [
  [{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0}],
  [{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0}],
  [{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0}],
  [{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":2,"featureType":0},{"tileType":1,"featureType":0},{"tileType":1,"featureType":1},{"tileType":1,"featureType":2},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0}],
  [{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0}],
  [{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0}],
  [{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0}],
  [{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0},{"tileType":0,"featureType":0}]
  ],
};

module.exports = {
  app: "maze",
  skinId: 'planter',
  levelDefinition: levelDef,
  tests: [
    {
      description: "Try to plant in empty space",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      customValidator: function () {
        return Maze.executionInfo.terminationValue() === PlanterHandler.TerminationValue.PLANT_IN_NON_SOIL;
      },
      xml: '<xml>' +
         ' <block type="when_run" deletable="false" movable="false">' +
         '   <next>' +
         '     <block type="maze_moveForward">' +
         '       <next>' +
         '         <block type="planter_plant"></block>' +
         '       </next>' +
         '     </block>' +
         '   </next>' +
         ' </block>' +
        '</xml>'
    },
    {
      description: "Try to plant in sprout",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      customValidator: function () {
        return Maze.executionInfo.terminationValue() === PlanterHandler.TerminationValue.PLANT_IN_NON_SOIL;
      },
      xml: '<xml>' +
         ' <block type="when_run" deletable="false" movable="false">' +
         '   <next>' +
         '     <block type="maze_moveForward">' +
         '       <next>' +
         '         <block type="maze_moveForward">' +
         '           <next>' +
         '             <block type="planter_plant">' +
         '               <next>' +
         '                 <block type="planter_plant">' +
         '                 </block>' +
         '               </next>' +
         '             </block>' +
         '           </next>' +
         '         </block>' +
         '       </next>' +
         '     </block>' +
         '   </next>' +
         ' </block>' +
        '</xml>'
    },

    {
      description: "Plant nothing",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      customValidator: function () {
        return Maze.executionInfo.terminationValue() === PlanterHandler.TerminationValue.DID_NOT_PLANT_EVERYWHERE;
      },
      xml: '<xml>' +
         ' <block type="when_run" deletable="false" movable="false">' +
         '   <next>' +
         '   </next>' +
         ' </block>' +
        '</xml>'
    },

    {
      description: "Plant all successfully",
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      xml: '<xml>' +
         ' <block type="when_run" deletable="false" movable="false">' +
         '   <next>' +
         '     <block type="controls_repeat">' +
         '       <title name="TIMES">3</title>' +
         '       <statement name="DO">' +
         '         <block type="maze_moveForward">' +
         '           <next>' +
         '             <block type="planter_ifAtSoil">' +
         '               <statement name="DO">' +
         '                 <block type="planter_plant"></block>' +
         '               </statement>' +
         '             </block>' +
         '           </next>' +
         '         </block>' +
         '       </statement>' +
         '     </block>' +
         '   </next>' +
         ' </block>' +
        '</xml>'
    }
  ]
};
