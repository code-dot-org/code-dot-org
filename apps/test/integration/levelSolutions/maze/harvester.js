import * as constants from '@cdo/apps/constants';
const {TestResults} = constants;

var levelDef = {
  'startDirection': 1, // Direction.EAST,
  'serializedMaze': [
    [{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false}],
    [{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false}],
    [{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false}],
    [{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[0],"startsHidden":false},{"tileType":2,"possibleFeatures":[0],"startsHidden":false},{"tileType":1,"value":1,"range":1,"possibleFeatures":[1],"startsHidden":false},{"tileType":1,"value":1,"range":1,"possibleFeatures":[2],"startsHidden":false},{"tileType":1,"value":1,"range":1,"possibleFeatures":[3],"startsHidden":false},{"tileType":0,"possibleFeatures":[0],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false}],
    [{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false}],
    [{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false}],
    [{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false}],
    [{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false},{"tileType":0,"possibleFeatures":[],"startsHidden":false}]
  ],
};

module.exports = {
  app: "maze",
  skinId: 'harvester',
  levelDefinition: levelDef,
  tests: [
    {
      description: "Infinite loop is detected and handled",
      expected: {
        result: false,
        testResult: TestResults.LEVEL_INCOMPLETE_FAIL
      },
      customValidator: function () {
        return Maze.executionInfo.terminationValue() === constants.BeeTerminationValue.INFINITE_LOOP;
      },
      xml: '<xml>' +
          '  <block type="when_run" deletable="false" movable="false">' +
          '    <next>' +
          '      <block type="harvester_untilHasPumpkin">' +
          '        <statement name="DO">' +
          '          <block type="harvester_ifHasCrop">' +
          '            <title name="LOC">Lettuce</title>' +
          '            <statement name="DO">' +
          '              <block type="harvester_lettuce"></block>' +
          '            </statement>' +
          '          </block>' +
          '        </statement>' +
          '      </block>' +
          '    </next>' +
          '  </block>' +
          '</xml>'
    },
    {
      description: "Try to harvest from wrong crop",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      customValidator: function () {
        return Maze.executionInfo.terminationValue() === constants.HarvesterTerminationValue.WRONG_CROP;
      },
      xml: '<xml>' +
         ' <block type="when_run" deletable="false" movable="false">' +
         '   <next>' +
         '     <block type="maze_moveForward">' +
         '       <next>' +
         '         <block type="harvester_pumpkin"></block>' +
         '       </next>' +
         '     </block>' +
         '   </next>' +
         ' </block>' +
        '</xml>'
    },
    {
      description: "Try to harvest from empty crop",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      customValidator: function () {
        return Maze.executionInfo.terminationValue() === constants.HarvesterTerminationValue.EMPTY_CROP;
      },
      xml: '<xml>' +
         ' <block type="when_run" deletable="false" movable="false">' +
         '   <next>' +
         '     <block type="maze_moveForward">' +
         '       <next>' +
         '         <block type="harvester_corn">' +
         '           <next>' +
         '             <block type="harvester_corn">' +
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
      description: "Try to harvest from nothing",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      customValidator: function () {
        return Maze.executionInfo.terminationValue() === constants.HarvesterTerminationValue.WRONG_CROP;
      },
      xml: '<xml>' +
         ' <block type="when_run" deletable="false" movable="false">' +
         '   <next>' +
         '     <block type="harvester_corn">' +
         '     </block>' +
         '   </next>' +
         ' </block>' +
        '</xml>'
    },

    {
      description: "Harvest some but not all",
      expected: {
        result: false,
        testResult: TestResults.APP_SPECIFIC_FAIL
      },
      customValidator: function () {
        return Maze.executionInfo.terminationValue() === constants.HarvesterTerminationValue.DID_NOT_COLLECT_EVERYTHING;
      },
      xml: '<xml>' +
         ' <block type="when_run" deletable="false" movable="false">' +
         '   <next>' +
         '     <block type="controls_repeat">' +
         '       <title name="TIMES">3</title>' +
         '       <statement name="DO">' +
         '         <block type="maze_moveForward">' +
         '           <next>' +
         '             <block type="harvester_ifAtCrop">' +
         '               <title name="LOC">Corn</title>' +
         '               <statement name="DO">' +
         '                 <block type="harvester_corn"></block>' +
         '               </statement>' +
         '             </block>' +
         '           </next>' +
         '         </block>' +
         '       </statement>' +
         '     </block>' +
         '   </next>' +
         ' </block>' +
        '</xml>'
    },

    {
      description: "Harvest all successfully",
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
         '             <block type="harvester_ifAtCrop">' +
         '               <title name="LOC">Corn</title>' +
         '               <statement name="DO">' +
         '                 <block type="harvester_corn"></block>' +
         '               </statement>' +
         '               <next>' +
         '                 <block type="harvester_ifAtCrop">' +
         '                   <title name="LOC">Pumpkin</title>' +
         '                   <statement name="DO">' +
         '                     <block type="harvester_pumpkin"></block>' +
         '                   </statement>' +
         '                   <next>' +
         '                     <block type="harvester_ifAtCrop">' +
         '                       <title name="LOC">Lettuce</title>' +
         '                       <statement name="DO">' +
         '                         <block type="harvester_lettuce"></block>' +
         '                       </statement>' +
         '                     </block>' +
         '                   </next>' +
         '                 </block>' +
         '               </next>' +
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
