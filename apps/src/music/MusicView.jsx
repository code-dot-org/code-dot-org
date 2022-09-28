/** @file Top-level view for Fish */
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import {InitSound} from './player/sound';
import CustomMarshalingInterpreter from '../lib/tools/jsinterpreter/CustomMarshalingInterpreter';
import {parseElement as parseXmlElement} from '../xml';
import queryString from 'query-string';
import {baseToolbox, createMusicToolbox} from './blockly/toolbox';
import Tabs from './Tabs';
import Timeline from './Timeline';
import {MUSIC_BLOCKS} from './blockly/musicBlocks';
import {BlockTypes} from './blockly/blockTypes';
import MusicPlayer from './player/MusicPlayer';

const baseUrl = 'https://cdo-dev-music-prototype.s3.amazonaws.com/';

const secondsPerMeasure = 2;

var hooks = {};

class MusicView extends React.Component {
  static propTypes = {
    isProjectLevel: PropTypes.bool.isRequired,
    isReadOnlyWorkspace: PropTypes.bool.isRequired,
    onMount: PropTypes.func.isRequired
  };

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
      updateNumber: 0
    };
  }

  componentDidMount() {
    this.props.onMount();

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

    this.initBlockly();

    setInterval(this.updateTimer, 1000 / 30);

    this.loadLibrary().then(library => {
      this.setState({library});
      const soundList = library.groups
        .map(group => {
          return group.folders?.map(folder => {
            return folder.sounds.map(sound => {
              return group.path + '/' + folder.path + '/' + sound.src;
            });
          });
        })
        .flat(2);
      this.workspace.updateToolbox(createMusicToolbox(library));
      this.player.setGroupPath(this.getCurrentGroup().path);
      InitSound(soundList);
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

    /*var theme = Blockly.Theme.defineTheme('dark', {
      'base': Blockly.Themes.Classic,
      'componentStyles': {
        'workspaceBackgroundColour': '#222'
      },*/

    for (let blockType of Object.keys(MUSIC_BLOCKS)) {
      Blockly.Blocks[blockType] = {
        init: function() {
          this.jsonInit(MUSIC_BLOCKS[blockType].definition);
        }
      };

      Blockly.JavaScript[blockType] = MUSIC_BLOCKS[blockType].generator;
    }

    const container = document.getElementById('blocklyDiv');

    this.workspace = Blockly.inject(container, {
      // Toolbox will be programmatically generated once music manifest is loaded
      toolbox: baseToolbox,
      grid: {spacing: 20, length: 0, colour: '#444', snap: true}
      //theme: {componentStyles: {workspaceBackgroundColour: '#222'}}
    });

    this.resizeBlockly();

    const xml = parseXmlElement(
      `<xml><block type="${
        BlockTypes.WHEN_RUN
      }" deletable="false" x="30" y="30"></block><block type="${
        BlockTypes.WHEN_TRIGGER
      }" deletable="false" x="30" y="170"></block><block type="${
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
    var blocklyArea = document.getElementById('blocklyArea');
    var blocklyDiv = document.getElementById('blocklyDiv');

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

  convertMeasureToSeconds = measure => {
    return measure * secondsPerMeasure;
  };

  convertSecondsToMeasure = seconds => {
    return Math.floor(seconds / secondsPerMeasure);
  };

  choosePanel = panel => {
    this.setState({currentPanel: panel});

    if (panel === 'timeline') {
      if (this.state.isPlaying) {
        this.stopSong();
      } else {
        this.playSong();
      }
    }

    this.resizeBlockly();
  };

  setGroupPanel = panel => {
    this.setState({groupPanel: panel});
  };

  playTrigger = () => {
    console.log('Playhead position: ' + this.player.getPlayheadPosition());
    this.callUserGeneratedCode(hooks.triggeredAtButton);
  };

  executeSong = () => {
    var generator = Blockly.Generator.blockSpaceToCode.bind(
      Blockly.Generator,
      'JavaScript'
    );

    const events = {
      whenRunButton: {code: generator(BlockTypes.WHEN_RUN)},
      whenTriggerButton: {code: generator(BlockTypes.WHEN_TRIGGER)},
      triggeredAtButton: {code: generator(BlockTypes.TRIGGERED_AT)}
    };

    CustomMarshalingInterpreter.evalWithEvents(
      {MusicPlayer: this.player},
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

    const mobileWidth = 601;
    const isDesktop = this.state.windowWidth >= mobileWidth;

    const showCode = isDesktop || this.state.currentPanel === 'code';
    const showTimeline = isDesktop || this.state.currentPanel === 'timeline';
    const currentPanel = this.state.currentPanel;

    const currentGroup = this.getCurrentGroup();

    const songData = {
      events: this.player.getSoundEvents()
    };

    return (
      <div
        style={{
          position: 'relative',
          backgroundColor: 'black',
          color: 'white',
          width: '100%',
          height: 'calc(100% - 50px)',
          borderRadius: 4,
          padding: 0,
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        <div
          id="blocklyArea"
          style={{
            float: 'left',
            width: '100%',
            marginTop: 10,
            height: showCode ? 'calc(100% - 110px)' : 0
          }}
        >
          <div id="blocklyDiv" style={{position: 'absolute'}} />
        </div>

        {showTimeline && (
          <Timeline
            currentGroup={currentGroup}
            isPlaying={this.state.isPlaying}
            playTrigger={this.playTrigger}
            songData={songData}
            currentAudioElapsedTime={this.state.currentAudioElapsedTime}
            convertMeasureToSeconds={this.convertMeasureToSeconds}
            baseUrl={baseUrl}
            currentMeasure={this.player.getCurrentMeasure()}
          />
        )}

        <Tabs
          isDesktop={isDesktop}
          currentPanel={currentPanel}
          choosePanel={this.choosePanel}
          isPlaying={this.state.isPlaying}
        />
      </div>
    );
  }
}

export default connect(state => ({
  isProjectLevel: state.pageConstants.isProjectLevel,
  isReadOnlyWorkspace: state.pageConstants.isReadOnlyWorkspace
}))(MusicView);
