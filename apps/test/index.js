//var testsContext = require.context("./unit", false, /Test$/);
//testsContext.keys().forEach(testsContext);

require('./unit/CommandHistoryTest.js');
require('./unit/JSInterpreterTest.js');
require('./unit/ObservableEventTest.js');
require('./unit/ObserverTest.js');
require('./unit/ToggleButtonTest.js');
require('./unit/acemodeTest.js');
require('./unit/authoredHintUtilsTest.js');
require('./unit/beeCellTest.js');
require('./unit/beeDrawingTest.js');
require('./unit/beeTest.js');
require('./unit/cellTest.js');
require('./unit/codegenTest.js');
require('./unit/dirtDrawingTest.js');
require('./unit/dropletUtilsTest.js');
require('./unit/ejsTest.js');
require('./unit/evalTests.js');
require('./unit/executionInfoTests.js');
require('./unit/experimentTest.js');
require('./unit/gridUtilsTest.js');
require('./unit/instructionsTest.js');
require('./unit/logConditionsTest.js');
require('./unit/mazeTest.js');
require('./unit/puzzleRatingUtilsTest.js');
require('./unit/runStateTest.js');
require('./unit/shareWarningsDialogTest.js');
require('./unit/tickWrapperTest.js');
require('./unit/utilityTests.js');
require('./unit/wordsearchTest.js');

// calc
require('./unit/calc/calcTests.js');
require('./unit/calc/equationSetTests.js');
require('./unit/calc/expressionNodeTests.js');
require('./unit/calc/iteratorTests.js');
require('./unit/calc/tokenTests.js');

// templates
require('./unit/templates/CrosshairOverlayTest.js');
require('./unit/templates/TooltipOverlayTest.js');
require('./unit/templates/VisualizationOverlayTest.js');

// netsim
require('./unit/netsim/ArgumentUtils.js');
require('./unit/netsim/NetSimEntity.js');
require('./unit/netsim/NetSimLocalClientNode.js');
//require('./unit/netsim/NetSimLogEntry.js');
require('./unit/netsim/NetSimLogPanel.js');
require('./unit/netsim/NetSimLogger.js');
//require('./unit/netsim/NetSimMessage.js');
require('./unit/netsim/NetSimPacketEditor.js');
require('./unit/netsim/NetSimRemoteNodeSelectionPanel.js');
require('./unit/netsim/NetSimRouterLogModal.js');
require('./unit/netsim/NetSimRouterNode.js');
require('./unit/netsim/NetSimSendPanel.js');
require('./unit/netsim/NetSimSlider.js');
require('./unit/netsim/NetSimTable.js');
require('./unit/netsim/NetSimVisualization.js');
require('./unit/netsim/NetSimVizAutoDnsNode.js');
require('./unit/netsim/NetSimVizElement.js');
require('./unit/netsim/NetSimVizNode.js');
require('./unit/netsim/NetSimVizSimulationNode.js');
require('./unit/netsim/NetSimVizSimulationWire.js');
require('./unit/netsim/NetSimVizWire.js');
require('./unit/netsim/NetSimWire.js');
require('./unit/netsim/Packet.js');
require('./unit/netsim/dataConverters.js');
require('./unit/netsim/netsimUtils.js');

// craft
require('./unit/craft/LevelModel.js');

// gamelab
require('./unit/gamelab/AnimationPickerTest.js');
require('./unit/gamelab/AnimationTabTest.js');
require('./unit/gamelab/ErrorDialogStackTest.js');
require('./unit/gamelab/animationModuleTest.js');
require('./unit/gamelab/reducersTest.js');

// makerlab
require('./unit/makerlab/boardControllerTest.js');

// applab
require('./unit/applab/AppLabCrosshairOverlayTest.js');
require('./unit/applab/AppLabTooltipOverlayTest.js');
require('./unit/applab/ChartApiTest.js');
require('./unit/applab/CompletionButtonTest.js');
require('./unit/applab/EventSandboxerTest.js');
//require('./unit/applab/ExporterTest.js');
require('./unit/applab/applabTest.js');
require('./unit/applab/dataCallbacksTests.js');
require('./unit/applab/setPropertyDropdownTest.js');
