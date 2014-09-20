// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">un endro programmiñ da welet</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Gwelet ar c\'hod JavaScript krouet.</span><span id="linkTooltip">Enrollañ ha liammañ d\'ar bloc\'hadoù a ran.</span><span id="runTooltip">Lañsañ ar programm termenet gant ar bloac\'hadoù \\nen takad labour. </span><span id="runProgram">Lañsañ ar programm</span><span id="resetProgram">Adderaouekaat</span><span id="dialogOk">Mat eo</span><span id="dialogCancel">Nullañ</span><span id="catLogic">Poell</span><span id="catLoops">Boukloù</span><span id="catMath">Matematik</span><span id="catText">Testenn</span><span id="catLists">Rolloù</span><span id="catColour">Liv</span><span id="catVariables">Argemmennoù</span><span id="catProcedures">Argerzhadoù</span><span id="httpRequestError">Ur gudenn zo gant ar reked.</span><span id="linkAlert">Rannañ ho ploc\'hoù gant al liamm-mañ :</span><span id="hashError">Digarezit. "%1" ne glot gant programm enrollet ebet.</span><span id="xmlError">Ne c\'haller ket kargañ ho restr enrollet. Marteze e oa bet krouet gant ur stumm disheñvel eus Blockly ?</span><span id="listVariable">roll</span><span id="textVariable">testenn</span></div>';
};


apps.dialog = function(opt_data, opt_ignored, opt_ijData) {
  return '<div id="dialogShadow" class="dialogAnimate"></div><div id="dialogBorder"></div><div id="dialog"></div>';
};


apps.codeDialog = function(opt_data, opt_ignored, opt_ijData) {
  return '<div id="dialogCode" class="dialogHiddenContent"><pre id="containerCode"></pre>' + apps.ok(null, null, opt_ijData) + '</div>';
};


apps.storageDialog = function(opt_data, opt_ignored, opt_ijData) {
  return '<div id="dialogStorage" class="dialogHiddenContent"><div id="containerStorage"></div>' + apps.ok(null, null, opt_ijData) + '</div>';
};


apps.ok = function(opt_data, opt_ignored, opt_ijData) {
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">Mat eo</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof mazepage == 'undefined') { var mazepage = {}; }


mazepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="Maze_moveForward">mont war-raok</span><span id="Maze_turnLeft">treiñ a-gleiz</span><span id="Maze_turnRight">Treiñ a-zehou</span><span id="Maze_doCode">gra</span><span id="Maze_elseCode">anez da se</span><span id="Maze_helpIfElse">Ur bloc\'h "Ma-Anez" a seven un dra pe egile.</span><span id="Maze_pathAhead">Ma vez un hent dirak</span><span id="Maze_pathLeft">Ma vez un hent a-gleiz</span><span id="Maze_pathRight">Ma vez un hent a-zehou</span><span id="Maze_repeatUntil">adober betek</span><span id="Maze_moveForwardTooltip">Lakait ar c\'hoarier da vont war-raok war-zu un \\ntakad. </span><span id="Maze_turnTooltip">Lakait ar c\'hoarier da dreiñ a-gleiz pe a-zehou \\na 90 derez. </span><span id="Maze_ifTooltip">Ma\'z eus un hent war an tu spisaet, \\ngra an oberoù-se neuze. </span><span id="Maze_ifelseTooltip">Ma\'z eus un hent war an tu spisaet, \\ngra ar c\'hentañ bloc\'had oberoù. \\nAnez, gra an eil bloc\'had oberoù. </span><span id="Maze_whileTooltip">Adc\'hra ar bloc\'hoù zo en diabarzh betek tizhout \\nar pal. </span><span id="Maze_capacity0">Chom a ra %0 bloc\'hoù ganeoc\'h.</span><span id="Maze_capacity1">Chom a ra %1 bloc\'h ganeoc\'h.</span><span id="Maze_capacity2">Chom a ra %2 bloc\'h ganeoc\'h.</span><span id="Maze_nextLevel">Gourc\'hemennoù ! Ha prest oc\'h da vont d\'al live %1 ?</span><span id="Maze_finalLevel">Gourc\'hemennoù ! Echuet ho peus al live diwezhañ.</span></div>';
};


mazepage.start = function(opt_data, opt_ignored, opt_ijData) {
  var output = mazepage.messages(null, null, opt_ijData) + '<table width="100%"><tr><td><h1><span id="title"><a href="../index.html">Blockly</a> : Milendall</span> &nbsp; ';
  for (var i161 = 1; i161 < 11; i161++) {
    output += ' ' + ((i161 == opt_ijData.level) ? '<span class="tab" id="selected">' + soy.$$escapeHtml(i161) + '</span>' : (i161 < opt_ijData.level) ? '<a class="tab previous" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i161) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i161) + '</a>' : '<a class="tab" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i161) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i161) + '</a>');
  }
  output += '</h1></td><td class="farSide"><select id="languageMenu" onchange="BlocklyApps.changeLanguage();"></select> &nbsp; <button id="pegmanButton" onmousedown="Maze.showPegmanMenu();"><img src="../../media/1x1.gif"><span>&#x25BE;</span></button></td></tr></table><div id="visualization"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgMaze" width="400px" height="400px"><g id="look"><path d="M 0,-15 a 15 15 0 0 1 15 15" /><path d="M 0,-35 a 35 35 0 0 1 35 35" /><path d="M 0,-55 a 55 55 0 0 1 55 55" /></g></svg><div id="capacityBubble"><div id="capacity"></div></div></div><table width="400"><tr><td style="width: 190px; text-align: center; vertical-align: top;"><button class="notext" title="Gwelet ar c\'hod JavaScript krouet." onclick="BlocklyApps.showCode(this);"><img src="../../media/1x1.gif" class="code icon21"></button><button id="linkButton" class="notext" title="Enrollañ ha liammañ d\'ar bloc\'hadoù a ran." onclick="BlocklyStorage.link();"><img src="../../media/1x1.gif" class="link icon21"></button></td><td><button id="runButton" class="primary" onclick="Maze.runButtonClick();" title="Laka ar c\'hoarier d\'ober ar pezh a lavar ar \\nbloc\'hoù. "><img src="../../media/1x1.gif" class="run icon21"> Lañsañ ar programm</button><button id="resetButton" class="primary" onclick="Maze.resetButtonClick();" style="display: none" title="Adlakaat an dudenn e deroù ar milendall."><img src="../../media/1x1.gif" class="stop icon21"> Adderaouekaat</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../javascript_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script>' + mazepage.toolbox(null, null, opt_ijData) + '<div id="blockly"></div><svg version="1.1" height="1px" width="1px"><text id="arrowTest" style="font-family: sans-serif; font-size: 11pt;">⟲⟳</text></svg><div id="pegmanMenu"></div>' + apps.dialog(null, null, opt_ijData) + apps.codeDialog(null, null, opt_ijData) + apps.storageDialog(null, null, opt_ijData) + '<div id="dialogDone" class="dialogHiddenContent"><div id="dialogDoneText" style="font-size: large; margin: 1em;"></div><img src="../../media/1x1.gif" id="pegSpin"><div id="dialogDoneButtons" class="farSide" style="padding: 1ex 3ex 0"></div></div><div id="dialogHelpStack" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Berniañ asambles daou vloc\'h kemennoù "mont war-raok" evit sikour ac\'hanon da dizhout ar pal.</td><td valign="top"><img src="help_stack.png" class="mirrorImg" height=63 width=136></td></tr></table></div><div id="dialogHelpOneTopBlock" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>El live-se ez peus ezhomm da verniañ bloc\'hoù an eil re war ar re all all en un takad labour gwenn.<iframe id="iframeOneTopBlock" src=""></iframe></td></tr></table></div><div id="dialogHelpRun" class="dialogHiddenContent"><table><tr><td>Run your program to see what happens.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpReset" class="dialogHiddenContent"><table><tr><td>Your program didn\'t solve the maze.  Press \'Reset\' and try again.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpRepeat" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>N\'o deus ket an urzhiataerioù kalz a vemor. Implij daou vloc\'h hepken evit tizhout ar pal. Implij ar bloc\'h "adober" evit seveniñ ur bloc\'h ouzhpenn ur wech.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpCapacity" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>You have used up all the blocks for this level.  To create a new block, you first need to delete an existing block.</td></tr></table></div><div id="dialogHelpRepeatMany" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Tizhit ar pal oc\'h implijout pemp bloc\'h hepken.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpIf" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Ur bloc\'h "ma" zo vo o vont da seveniñ ar pezh zo e-barzh ma\'z eo gwir an amplegad. Klask treiñ a-gleiz ma\'z eus un hent war an tu kleiz.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpMenu" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td id="helpMenuText">Click on %1 in the \'if\' block to change its condition.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpIfElse" class="dialogHiddenContent"><table><tr><td><img src="help_down.png"></td><td>Ur bloc\'h "Ma-Anez" a seven un dra pe egile.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpWallFollow" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Daoust ha gallout a rit diskoulmañ ar milendall luziet-mañ ? Klaskit mont a-hed ar voger gleiz. Evit ar brogrammerien arroutet-mat hepken !' + apps.ok(null, null, opt_ijData) + '</td></tr></table></div>';
  return output;
};


mazepage.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none;"><block type="maze_moveForward"></block><block type="maze_turn"><title name="DIR">turnLeft</title></block><block type="maze_turn"><title name="DIR">turnRight</title></block>' + ((opt_ijData.level > 2) ? '<block type="maze_forever"></block>' + ((opt_ijData.level == 6) ? '<block type="maze_if"><title name="DIR">isPathLeft</title></block>' : (opt_ijData.level > 6) ? '<block type="maze_if"></block>' + ((opt_ijData.level > 8) ? '<block type="maze_ifElse"></block>' : '') : '') : '') + '</xml>';
};


mazepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return mazepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
