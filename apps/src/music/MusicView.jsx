/** @file Top-level view for Music */
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import classNames from 'classnames';
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
import {PLAY_ICON, STOP_ICON, Triggers} from './constants';
import {musicLabDarkTheme} from './blockly/themes';
import AnalyticsReporter from './analytics/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import {getStaticFilePath} from '@cdo/apps/music/utils';
import moduleStyles from './music.module.scss';
import feedbackStyles from './feedback.module.scss';

const baseUrl = 'https://curriculum.code.org/media/musiclab/';

var hooks = {};

const InstructionsPositions = {
  TOP: 'TOP',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT'
};

const instructionPositionOrder = [
  InstructionsPositions.TOP,
  InstructionsPositions.LEFT,
  InstructionsPositions.RIGHT
];

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
      timelineAtTop: false,
      showInstructions: true,
      instructionsPosIndex: 1,
      feedbackClicked: false
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

    Blockly.blockly_.Extensions.register('preview_extension', function() {
      this.getField('image').setOnClickHandler(function() {
        if (self.state.isPlaying) {
          return;
        }
        const id = this.getSourceBlock()
          .getField('sound')
          .getValue();

        if (self.player.isPreviewPlaying(id)) {
          self.player.stopAndCancelPreviews();
          this.setValue(getStaticFilePath(PLAY_ICON));
        } else {
          this.setValue(getStaticFilePath(STOP_ICON));
          self.player.previewSound(id, () => {
            this.setValue(getStaticFilePath(PLAY_ICON));
          });
        }
      });
    });

    Blockly.blockly_.Extensions.register(
      'clear_preview_on_change_extension',
      function() {
        this.setOnChange(function(event) {
          if (
            event.blockId === this.id &&
            event.type === Blockly.blockly_.Events.BLOCK_CHANGE &&
            event.name === 'sound' &&
            self.player.isPreviewPlaying(event.oldValue)
          ) {
            self.player.stopAndCancelPreviews();
          }
        });
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
    this.loadCode();

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
    const defaultCode = require('@cdo/static/music/defaultCode.json');

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
      this.player.stopAndCancelPreviews();
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

    this.saveCode();
  };

  saveCode = () => {
    const code = Blockly.blockly_.serialization.workspaces.save(this.workspace);
    const codeJson = JSON.stringify(code);
    localStorage.setItem('musicLabSavedCode', codeJson);
  };

  loadCode = () => {
    const existingCode = localStorage.getItem('musicLabSavedCode');
    if (existingCode) {
      const exitingCodeJson = JSON.parse(existingCode);
      Blockly.blockly_.serialization.workspaces.load(
        exitingCodeJson,
        this.workspace
      );
    } else {
      this.clearCode();
    }
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

    const blocklyDiv = document.getElementById('blockly-div');

    blocklyDiv.style.width = '100%';
    blocklyDiv.style.height = '100%';
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

  toggleInstructions = () => {
    this.setState({
      showInstructions: !this.state.showInstructions
    });
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
    if (event.key === 'n') {
      this.setState({
        instructionsPosIndex:
          (this.state.instructionsPosIndex + 1) %
          instructionPositionOrder.length
      });
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

  onFeedbackClicked = () => {
    window.open(
      'https://docs.google.com/forms/d/e/1FAIpQLScnUgehPPNjhSNIcCpRMcHFgtE72TlfTOh6GkER6aJ-FtIwTQ/viewform?usp=sf_link',
      '_blank'
    );

    this.setState({feedbackClicked: true});
  };

  renderInstructions(position) {
    if (position === InstructionsPositions.TOP) {
      return (
        <div
          id="instructions-area"
          className={classNames(
            moduleStyles.instructionsArea,
            moduleStyles.instructionsTop
          )}
        >
          <Instructions
            instructions={this.state.instructions}
            baseUrl={baseUrl}
            analyticsReporter={this.analyticsReporter}
          />
          <div
            id="share-area"
            className={classNames(
              moduleStyles.shareArea,
              moduleStyles.shareTop
            )}
          >
            <SharePlaceholder analyticsReporter={this.analyticsReporter} />
          </div>
        </div>
      );
    }

    return (
      <div
        className={classNames(
          moduleStyles.instructionsArea,
          moduleStyles.instructionsSide,
          position === InstructionsPositions.LEFT
            ? moduleStyles.instructionsLeft
            : moduleStyles.instructionsRight
        )}
      >
        <Instructions
          instructions={this.state.instructions}
          baseUrl={baseUrl}
          analyticsReporter={this.analyticsReporter}
          vertical={true}
          right={position === InstructionsPositions.RIGHT}
        />
      </div>
    );
  }

  renderTimelineArea(timelineAtTop) {
    const songData = {
      events: this.player.getSoundEvents()
    };

    return (
      <div
        id="timeline-area"
        className={classNames(
          moduleStyles.timelineArea,
          timelineAtTop ? moduleStyles.timelineTop : moduleStyles.timelineBottom
        )}
      >
        <Controls
          isPlaying={this.state.isPlaying}
          setPlaying={this.setPlaying}
          playTrigger={this.playTrigger}
          top={timelineAtTop}
          startOverClicked={this.clearCode}
          toggleInstructions={this.toggleInstructions}
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
        {!this.state.feedbackClicked && (
          <div
            className={feedbackStyles.feedbackButton}
            onClick={this.onFeedbackClicked}
          >
            Tell us what you think
          </div>
        )}
      </div>
    );
  }

  render() {
    const instructionsPosition =
      instructionPositionOrder[this.state.instructionsPosIndex];

    return (
      <div id="music-lab-container" className={moduleStyles.container}>
        {this.state.showInstructions &&
          instructionsPosition === InstructionsPositions.TOP &&
          this.renderInstructions(InstructionsPositions.TOP)}

        {this.state.timelineAtTop && this.renderTimelineArea(true)}

        <div className={moduleStyles.middleArea}>
          {this.state.showInstructions &&
            instructionsPosition === InstructionsPositions.LEFT &&
            this.renderInstructions(InstructionsPositions.LEFT)}

          <div id="blockly-area" className={moduleStyles.blocklyArea}>
            <div id="blockly-div" />
          </div>

          {this.state.showInstructions &&
            instructionsPosition === InstructionsPositions.RIGHT &&
            this.renderInstructions(InstructionsPositions.RIGHT)}
        </div>

        {!this.state.timelineAtTop && this.renderTimelineArea(false)}
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
