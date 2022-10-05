/** @file Top-level view for Music */
import React from 'react';
import _ from 'lodash';
import CustomMarshalingInterpreter from '../lib/tools/jsinterpreter/CustomMarshalingInterpreter';
import {parseElement as parseXmlElement} from '../xml';
import queryString from 'query-string';
import {baseToolbox, createMusicToolbox} from './blockly/toolbox';
import Controls from './Controls';
import Timeline from './Timeline';
import {MUSIC_BLOCKS} from './blockly/musicBlocks';
import {BlockTypes} from './blockly/blockTypes';
import MusicPlayer from './player/MusicPlayer';
import GoogleBlockly from 'blockly/core';
import CdoTheme from '../blockly/addons/cdoTheme';
import InputContext from './InputContext';
import {Triggers} from './constants';

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);

  // The maximum is inclusive and the minimum is inclusive.
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const baseUrl = 'https://cdo-dev-music-prototype.s3.amazonaws.com/';

var hooks = {};

export default class MusicView extends React.Component {
  callUserGeneratedCode = fn => {
    try {
      fn.call(MusicView, this.player);
    } catch (e) {
      // swallow error. should we also log this somewhere?
      if (console) {
        console.log(e);
      }
    }
  };

  constructor(props) {
    super(props);

    this.codeAppRef = document.getElementById('codeApp');
    this.player = new MusicPlayer();
    this.inputContext = new InputContext();

    // We have seen on Android devices that window.innerHeight will always be the
    // same whether in landscape or portrait orientation.  Given that we tell
    // users to rotate to landscape, adjust to match what we see on iOS devices.
    const windowWidth = Math.max(window.innerWidth, window.innerHeight);
    const windowHeight = Math.min(window.innerWidth, window.innerHeight);

    // Set these values so that the first render can work with them.
    // Note that appWidth/Height are the dimensions of the "codeApp" div
    // which is the space allocated for an app.
    this.state = {
      windowWidth,
      windowHeight,
      appWidth: this.codeAppRef.offsetWidth,
      appHeight: this.codeAppRef.offsetHeight,
      library: null,
      currentPanel: 'groups',
      groupPanel: 'all',
      isPlaying: false,
      startPlayingAudioTime: null,
      currentAudioElapsedTime: 0,
      updateNumber: 0,
      timelineAtTop: !!getRandomIntInclusive(0, 1),
      showInstructions: false
    };
  }

  componentDidMount() {
    const windowWidth = Math.max(window.innerWidth, window.innerHeight);
    const windowHeight = Math.min(window.innerWidth, window.innerHeight);

    this.setState({
      windowWidth,
      windowHeight,
      appWidth: this.codeAppRef.offsetWidth,
      appHeight: this.codeAppRef.offsetHeight
    });

    const resizeThrottleWaitTime = 100;
    this.resizeListener = _.throttle(this.onResize, resizeThrottleWaitTime);
    window.addEventListener('resize', this.resizeListener);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.resizeListener);
      window.visualViewport.addEventListener('scroll', this.resizeListener);
    }

    document.body.addEventListener('keyup', this.handleKeyUp);

    this.initBlockly();

    setInterval(this.updateTimer, 1000 / 30);

    this.loadLibrary().then(library => {
      this.setState({library});
      this.workspace.updateToolbox(createMusicToolbox(library));
      this.player.initialize(library);
    });
  }

  componentDidUpdate() {
    this.resizeBlockly();
  }

  updateTimer = () => {
    if (this.state.isPlaying) {
      this.setState({
        currentAudioElapsedTime: this.player.getCurrentAudioElapsedTime()
      });
    }
  };

  loadLibrary = async () => {
    let parameters = queryString.parse(location.search);
    const libraryFilename = parameters['library']
      ? `music-library-${parameters['library']}.json`
      : 'music-library.json';
    const response = await fetch(baseUrl + libraryFilename);
    const library = await response.json();
    return library;
  };

  initBlockly = () => {
    var self = this;

    Blockly.blockly_.Extensions.register('dynamic_menu_extension', function() {
      this.getInput('sound').appendField(
        new Blockly.FieldDropdown(function() {
          var options = [['anything', 'anything']];
          if (self.state.groupPanel && self.state.groupPanel !== 'main') {
            const folders = self.getCurrentGroupSounds();
            options = folders
              .map(folder => {
                return folder.sounds.map(sound => {
                  return [
                    folder.name + '/' + sound.name,
                    folder.path + '/' + sound.src
                  ];
                });
              })
              .flat(1);
          }

          return options;
        }),
        'sound'
      );
    });

    var theme = GoogleBlockly.Theme.defineTheme('dark', {
      base: CdoTheme,
      componentStyles: {
        toolboxBackgroundColour: '#222'
      }
    });

    Blockly.blockly_.Extensions.register(
      'dynamic_trigger_extension',
      function() {
        this.getInput('trigger').appendField(
          new Blockly.FieldDropdown(function() {
            return Triggers.map(trigger => [trigger.dropdownLabel, trigger.id]);
          }),
          'trigger'
        );
      }
    );

    for (let blockType of Object.keys(MUSIC_BLOCKS)) {
      Blockly.Blocks[blockType] = {
        init: function() {
          this.jsonInit(MUSIC_BLOCKS[blockType].definition);
        }
      };

      Blockly.JavaScript[blockType] = MUSIC_BLOCKS[blockType].generator;
    }

    const container = document.getElementById('blockly-div');

    this.workspace = Blockly.inject(container, {
      // Toolbox will be programmatically generated once music manifest is loaded
      toolbox: baseToolbox,
      grid: {spacing: 20, length: 0, colour: '#444', snap: true},
      theme: theme
    });

    this.resizeBlockly();

    const xml = parseXmlElement(
      `<xml><block type="${
        BlockTypes.WHEN_RUN
      }" deletable="false" x="30" y="30"></block><block type="${
        BlockTypes.TRIGGERED_AT
      }" deletable="false" x="500" y="30"></block></xml>`
    );
    Blockly.Xml.domToBlockSpace(Blockly.mainBlockSpace, xml);

    Blockly.addChangeListener(Blockly.mainBlockSpace, this.onBlockSpaceChange);

    this.workspace.registerButtonCallback('createVariableHandler', button => {
      Blockly.Variables.createVariableButtonHandler(
        button.getTargetWorkspace(),
        null,
        null
      );
    });
  };

  onBlockSpaceChange = () => {
    //console.log('onBlockSpaceChange');

    this.executeSong();

    this.setState({updateNumber: this.state.updateNumber + 1});
  };

  onResize = () => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    //const windowWidth = Math.max(window.innerWidth, window.innerHeight);
    //const windowHeight = Math.min(window.innerWidth, window.innerHeight);

    // Check that the window dimensions have actually changed to avoid
    // unnecessary event-processing on iOS Safari.
    if (
      this.state.windowWidth !== windowWidth ||
      this.state.windowHeight !== windowHeight
    ) {
      const appWidth = this.codeAppRef.offsetWidth;
      const appHeight = this.codeAppRef.offsetHeight;

      this.setState({windowWidth, windowHeight, appWidth, appHeight});
    }

    //this.resizeBlockly();
  };

  resizeBlockly = () => {
    var blocklyArea = document.getElementById('blockly-area');
    var blocklyDiv = document.getElementById('blockly-div');

    // Compute the absolute coordinates and dimensions of blocklyArea.
    /*
    var element = blocklyArea;
    var x = 0;
    var y = 0;
    do {
      x += element.offsetLeft;
      y += element.offsetTop;
      element = element.offsetParent;
    } while (element);
    // Position blocklyDiv over blocklyArea.
    blocklyDiv.style.left = x + 'px';
    blocklyDiv.style.top = y + 'px';
    */
    blocklyDiv.style.width = blocklyArea.offsetWidth + 'px';
    blocklyDiv.style.height = blocklyArea.offsetHeight + 'px';
    Blockly.svgResize(this.workspace);
  };

  choosePanel = panel => {
    this.setState({currentPanel: panel});
    this.resizeBlockly();
  };

  setPlaying = play => {
    if (play) {
      this.playSong();
    } else {
      this.stopSong();
    }
  };

  setGroupPanel = panel => {
    this.setState({groupPanel: panel});
  };

  playTrigger = id => {
    console.log('Playhead position: ' + this.player.getPlayheadPosition());
    this.inputContext.onTrigger(id);
    this.callUserGeneratedCode(hooks.triggeredAtButton);
  };

  executeSong = () => {
    var generator = Blockly.Generator.blockSpaceToCode.bind(
      Blockly.Generator,
      'JavaScript'
    );

    const events = {
      whenRunButton: {code: generator(BlockTypes.WHEN_RUN)},
      triggeredAtButton: {code: generator(BlockTypes.TRIGGERED_AT)}
    };

    CustomMarshalingInterpreter.evalWithEvents(
      {MusicPlayer: this.player, InputContext: this.inputContext},
      events
    ).hooks.forEach(hook => {
      //console.log('hook', hook);
      hooks[hook.name] = hook.func;
    });

    this.player.clearQueue();

    this.callUserGeneratedCode(hooks.whenRunButton);
  };

  playSong = () => {
    this.player.stopSong();
    this.executeSong();
    this.player.playSong();

    this.setState({isPlaying: true});

    console.log(Blockly.getWorkspaceCode());
  };

  stopSong = () => {
    this.player.stopSong();
    this.inputContext.clearTriggers();

    this.setState({isPlaying: false});
  };

  previewSound = id => {
    this.player.playSoundImmediately(id);
  };

  getCurrentGroup = () => {
    const currentGroup =
      this.state.groupPanel !== 'main' &&
      this.state.library &&
      this.state.library.groups.find(
        group => group.id === this.state.groupPanel
      );

    return currentGroup;
  };

  getCurrentGroupSounds = () => {
    return this.getCurrentGroup()?.folders;
  };

  handleKeyUp = event => {
    if (event.key === 't') {
      this.setState({timelineAtTop: !this.state.timelineAtTop});
    }
    if (event.key === 'i') {
      this.setState({showInstructions: !this.state.showInstructions});
    }
    Triggers.map(trigger => {
      if (event.key === trigger.keyboardKey) {
        this.playTrigger(trigger.id);
      }
    });
  };

  render() {
    // The tutorial has a width:height ratio of 16:9.
    const aspectRatio = 16 / 9;

    // Let's minimize the tutorial width at 320px.
    const minAppWidth = 320;

    // Let's maximize the tutorial width at 1280px.
    const maxAppWidth = 1280;

    // Leave space above the small footer.
    const reduceAppHeight = 36;

    let containerWidth;

    // Constrain tutorial to maximum width.
    const maxContainerWidth = Math.min(this.state.appWidth, maxAppWidth);

    // Use the smaller of the space allocated for the app and the window height,
    // and leave space above the small footer.
    const maxContainerHeight =
      Math.min(this.state.appHeight, this.state.windowHeight) - reduceAppHeight;

    if (maxContainerWidth / maxContainerHeight > aspectRatio) {
      // Constrain by height.
      containerWidth = maxContainerHeight * aspectRatio;
    } else {
      // Constrain by width.
      containerWidth = maxContainerWidth;
    }

    // Constrain tutorial to minimum width;
    if (containerWidth < minAppWidth) {
      containerWidth = minAppWidth;
    }

    const songData = {
      events: this.player.getSoundEvents()
    };

    const blocklyAreaHeight = this.state.showInstructions
      ? 'calc(100% - 250px)'
      : 'calc(100% - 150px)';

    const blocklyAreaTop = this.state.showInstructions
      ? this.state.timelineAtTop
        ? 250
        : 100
      : this.state.timelineAtTop
      ? 150
      : 0;

    const timelinePosition = this.state.showInstructions
      ? this.state.timelineAtTop
        ? {top: 100}
        : {bottom: 0}
      : this.state.timelineAtTop
      ? {top: 0}
      : {bottom: 0};

    return (
      <div
        id="music-lab-container"
        style={{
          position: 'relative',
          backgroundColor: 'black',
          color: 'white',
          width: '100%',
          height: 'calc(100% - 0px)',
          borderRadius: 4,
          padding: 0,
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        {this.state.showInstructions && (
          <div
            id="instructions-area"
            style={{
              color: 'white',
              height: 90,
              backgroundColor: 'black',
              borderRadius: 4,
              padding: 0,
              boxSizing: 'border-box',
              overflow: 'scroll'
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </div>
        )}
        <div
          id="blockly-area"
          style={{
            float: 'left',
            width: '100%',
            height: blocklyAreaHeight,
            position: 'absolute',
            top: blocklyAreaTop
          }}
        >
          <div id="blockly-div" />

          <Controls
            isPlaying={this.state.isPlaying}
            setPlaying={this.setPlaying}
            playTrigger={this.playTrigger}
          />
        </div>

        <div
          id="timeline-area"
          style={{
            height: 140,
            width: '100%',
            boxSizing: 'border-box',
            position: 'absolute',
            ...timelinePosition
          }}
        >
          <Timeline
            isPlaying={this.state.isPlaying}
            songData={songData}
            currentAudioElapsedTime={this.state.currentAudioElapsedTime}
            convertMeasureToSeconds={measure =>
              this.player.convertMeasureToSeconds(measure)
            }
            currentMeasure={this.player.getCurrentMeasure()}
            sounds={this.getCurrentGroupSounds()}
          />
        </div>
      </div>
    );
  }
}
