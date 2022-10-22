/** @file Top-level view for Music */
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {Provider, connect} from 'react-redux';
import CustomMarshalingInterpreter from '../lib/tools/jsinterpreter/CustomMarshalingInterpreter';
import queryString from 'query-string';
import {baseToolbox, createMusicToolbox} from './blockly/toolbox';
import Instructions from './Instructions';
import SharePlaceholder from './SharePlaceholder';
import Controls from './Controls';
import Timeline from './Timeline';
import {MUSIC_BLOCKS} from './blockly/musicBlocks';
import {BlockTypes} from './blockly/blockTypes';
import MusicPlayer from './player/MusicPlayer';
import InputContext from './InputContext';
import {Triggers} from './constants';
import {musicLabDarkTheme} from './blockly/themes';
import AnalyticsReporter from './analytics/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);

  // The maximum is inclusive and the minimum is inclusive.
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const baseUrl = 'https://curriculum.code.org/media/musiclab/';

var hooks = {};

class UnconnectedMusicView extends React.Component {
  static propTypes = {
    // populated by Redux
    userId: PropTypes.number,
    userType: PropTypes.string,
    signInState: PropTypes.oneOf(Object.values(SignInState))
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
    this.inputContext = new InputContext();
    this.analyticsReporter = new AnalyticsReporter();

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
      instructions: null,
      currentPanel: 'groups',
      groupPanel: 'all',
      isPlaying: false,
      startPlayingAudioTime: null,
      currentAudioElapsedTime: 0,
      updateNumber: 0,
      timelineAtTop: !!getRandomIntInclusive(0, 1),
      showInstructions: true
    };
  }

  componentDidMount() {
    this.analyticsReporter.onSessionStart();
    // TODO: the 'beforeunload' callback is advised against as it is not guaranteed to fire on mobile browsers. However,
    // we need a way of reporting analytics when the user navigates away from the page. Check with Amplitude for the
    // correct approach.
    window.addEventListener('beforeunload', () =>
      this.analyticsReporter.onSessionEnd()
    );
    this.analyticsReporter.setUserProperties(
      this.props.userId,
      this.props.userType,
      this.props.signInState
    );

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

    this.loadLibrary().then(library => {
      this.setState({library});
      this.initBlockly();
      this.workspace.updateToolbox(createMusicToolbox(library, 'dropdown'));
      this.player.initialize(library);
      setInterval(this.updateTimer, 1000 / 30);
    });

    this.loadInstructions().then(instructions => {
      this.setState({instructions});
    });
  }

  componentDidUpdate(prevProps) {
    this.resizeBlockly();
    if (
      prevProps.userId !== this.props.userId ||
      prevProps.userType !== this.props.userType ||
      prevProps.signInState !== this.props.signInState
    ) {
      this.analyticsReporter.setUserProperties(
        this.props.userId,
        this.props.userType,
        this.props.signInState
      );
    }
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

  loadInstructions = async () => {
    const libraryFilename = 'music-instructions.json';
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
      theme: musicLabDarkTheme,
      renderer: 'cdo_renderer_zelos'
    });

    this.resizeBlockly();

    // Set initial blocks.
    const existingCode = this.loadCode();
    if (existingCode) {
      const exitingCodeJson = JSON.parse(existingCode);
      Blockly.blockly_.serialization.workspaces.load(
        exitingCodeJson,
        this.workspace
      );
    } else {
      this.clearCode();
    }

    Blockly.addChangeListener(Blockly.mainBlockSpace, this.onBlockSpaceChange);

    this.workspace.registerButtonCallback('createVariableHandler', button => {
      Blockly.Variables.createVariableButtonHandler(
        button.getTargetWorkspace(),
        null,
        null
      );
    });
  };

  clearCode = () => {
    // Default code.
    const defaultCode = {
      blocks: {
        languageVersion: 0,
        blocks: [
          {type: 'when_run', x: 30, y: 30},
          {
            type: 'triggered_at',
            x: 500,
            y: 30,
            fields: {
              trigger: 'trigger1'
            }
          }
        ]
      },
      variables: [{name: 'currentTime'}]
    };

    Blockly.blockly_.serialization.workspaces.load(defaultCode, this.workspace);

    this.setPlaying(false);

    this.player.clearAllSoundEvents();

    this.saveCode();
  };

  onBlockSpaceChange = e => {
    // A drag event can leave the blocks in a temporarily unusable state,
    // e.g. when a disabled variable is dragged into a slot, it can still
    // be disabled.
    // A subsequent non-drag event should arrive and the blocks will be
    // usable then.
    // It's possible that other events should similarly be ignored here.
    if (e.type === Blockly.blockly_.Events.BLOCK_DRAG) {
      return;
    }

    // Stop all when_run sounds that are still to play, because if they
    // are still valid after the when_run code is re-executed, they
    // will be scheduled again.
    this.stopAllSoundsStillToPlay();

    // Also clear all when_run sounds from the events list, because it
    // will be recreated in its entirely when the when_run code is
    // re-executed.
    this.player.clearWhenRunEvents();

    this.executeSong();

    console.log('onBlockSpaceChange', Blockly.getWorkspaceCode());

    this.analyticsReporter.onBlocksUpdated(this.workspace.getAllBlocks());

    // This is a way to tell React to re-render the scene, notably
    // the timeline.
    this.setState({updateNumber: this.state.updateNumber + 1});

    // Save the code to local storage.
    this.saveCode();
  };

  saveCode = () => {
    const code = Blockly.blockly_.serialization.workspaces.save(this.workspace);
    const codeJson = JSON.stringify(code);
    localStorage.setItem('musicLabSavedCode', codeJson);
  };

  loadCode = () => {
    return localStorage.getItem('musicLabSavedCode');
  };

  onResize = () => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // We will likely use this logic, borrowed from other labs, once
    // we revisit mobile support across many devices.
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
  };

  resizeBlockly = () => {
    if (!this.workspace) {
      return;
    }

    var blocklyArea = document.getElementById('blockly-area');
    var blocklyDiv = document.getElementById('blockly-div');

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
    //console.log('Playhead position: ' + this.player.getPlayheadPosition());
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

    this.callUserGeneratedCode(hooks.whenRunButton);
  };

  playSong = () => {
    this.player.stopSong();

    // Clear the events list of when_run sounds, because it will be
    // populated next.
    this.player.clearWhenRunEvents();

    this.executeSong();

    this.player.playSong();

    this.setState({isPlaying: true});

    console.log('playSong', Blockly.getWorkspaceCode());
  };

  stopSong = () => {
    this.player.stopSong();
    this.inputContext.clearTriggers();

    // Clear the events list, and hence the visual timeline, of any
    // user-triggered sounds.
    this.player.clearTriggeredEvents();

    this.setState({isPlaying: false});
  };

  stopAllSoundsStillToPlay = () => {
    this.player.stopAllSoundsStillToPlay();
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
    // Don't handle a keyboard shortcut if the active element is an
    // input field, since the user is probably trying to type something.
    if (document.activeElement.tagName.toLowerCase() === 'input') {
      return;
    }

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
    if (event.key === 'd') {
      this.workspace.updateToolbox(
        createMusicToolbox(this.state.library, 'dropdown')
      );
    }
    if (event.key === 'v') {
      this.workspace.updateToolbox(
        createMusicToolbox(this.state.library, 'valueSample')
      );
    }
    if (event.key === 'p') {
      this.workspace.updateToolbox(
        createMusicToolbox(this.state.library, 'playSample')
      );
    }
    if (event.code === 'Space') {
      this.setPlaying(!this.state.isPlaying);
    }
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
      ? 'calc(100% - 300px)'
      : 'calc(100% - 200px)';

    const blocklyAreaTop = this.state.showInstructions
      ? this.state.timelineAtTop
        ? 300
        : 100
      : this.state.timelineAtTop
      ? 200
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
          overflow: 'hidden',
          userSelect: 'none'
        }}
      >
        {this.state.showInstructions && (
          <div>
            <div
              id="instructions-area"
              style={{
                float: 'left',
                color: 'white',
                width: 'calc(100% - 150px)',
                height: 90,
                backgroundColor: 'black',
                borderRadius: 4,
                padding: 0,
                boxSizing: 'border-box',
                marginRight: 10
              }}
            >
              <Instructions
                instructions={this.state.instructions}
                baseUrl={baseUrl}
                analyticsReporter={this.analyticsReporter}
              />
            </div>
            <div id="share-area" style={{width: 140, float: 'left'}}>
              <SharePlaceholder analyticsReporter={this.analyticsReporter} />
            </div>
          </div>
        )}
        <div
          id="blockly-area"
          style={{
            float: 'left',
            width: '100%',
            height: blocklyAreaHeight,
            position: 'absolute',
            top: blocklyAreaTop,
            borderRadius: 4,
            overflow: 'hidden'
          }}
        >
          <div id="blockly-div" />
        </div>

        <div
          id="timeline-area"
          style={{
            height: 200,
            width: '100%',
            boxSizing: 'border-box',
            position: 'absolute',
            display: 'flex',
            flexDirection: this.state.timelineAtTop
              ? 'column-reverse'
              : 'column',
            ...timelinePosition
          }}
        >
          <Controls
            isPlaying={this.state.isPlaying}
            setPlaying={this.setPlaying}
            playTrigger={this.playTrigger}
            top={this.state.timelineAtTop}
            startOverClicked={this.clearCode}
          />
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

const MusicView = connect(state => ({
  userId: state.currentUser.userId,
  userType: state.currentUser.userType,
  signInState: state.currentUser.signInState
}))(UnconnectedMusicView);

const MusicLabView = () => {
  return (
    <Provider store={getStore()}>
      <MusicView />
    </Provider>
  );
};

export default MusicLabView;
