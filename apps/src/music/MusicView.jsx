/** @file Top-level view for Fish */
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
//import GoogleBlockly from 'blockly/core';
import FontAwesome from '../templates/FontAwesome';
import {InitSound, GetCurrentAudioTime, PlaySound} from './sound';
import CustomMarshalingInterpreter from '../lib/tools/jsinterpreter/CustomMarshalingInterpreter';
import {parseElement as parseXmlElement} from '../xml';

const songData = {
  events: [/*
    {
      type: 'play',
      id: 'baddie-seen',
      when: 0
    },
    {
      type: 'play',
      id: 'baddie-seen',
      when: 1
    },
    {
      type: 'play',
      id: 'baddie-seen',
      when: 3
    }*/
  ]
};




var hooks = {};

class MusicView extends React.Component {
  static propTypes = {
    isProjectLevel: PropTypes.bool.isRequired,
    isReadOnlyWorkspace: PropTypes.bool.isRequired,
    onMount: PropTypes.func.isRequired
  };

  api = {
    play_sound: (id, measure) => {
      console.log('play sound', id, measure);

      songData.events.push({
        type: 'play',
        id: id,
        when: measure
      });
    }
  };

  callUserGeneratedCode = fn => {
    try {
      fn.call(MusicView, this.api);
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
      appHeight: this.codeAppRef.offsetHeight
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
      appHeight: this.codeAppRef.offsetHeight,
      currentPanel: 'samplepacks',
      samplePanel: 'main',
      isPlaying: false,
      startPlayingAudioTime: null,
      currentAudioTime: null
    });

    const resizeThrottleWaitTime = 100;
    this.resizeListener = _.throttle(this.onResize, resizeThrottleWaitTime);
    window.addEventListener('resize', this.resizeListener);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.resizeListener);
      window.visualViewport.addEventListener('scroll', this.resizeListener);
    }

    this.initBlockly();

    InitSound();

    setInterval(this.updateTimer, 1000 / 30);
  }

  updateTimer = () => {
    if (this.state.isPlaying) {
      this.setState({currentAudioTime: GetCurrentAudioTime()});
    }
  };

  initBlockly = () => {
    var toolbox = {
      kind: 'flyoutToolbox',
      contents: [
        {
          kind: 'block',
          type: 'play_sound'
        }
      ]
    };

    Blockly.Blocks['play_sound'] = {
      init: function() {
        this.jsonInit({
          type: 'play_sound',
          message0: '%1 play %2 at measure %3',
          args0: [
            {
              type: 'field_image',
              src: 'https://code.org/shared/images/play-button.png',
              width: 15,
              height: 20,
              alt: '*',
              flipRtl: false
            },
            {
              type: 'field_dropdown',
              name: 'sound',
              options: [
                ['drum loop', 'baddie-seen'],
                ['vocals', 'vocals'],
                ['main tune', 'maintune']
              ]
            },
            {
              type: 'field_number',
              name: 'measure',
              value: 1,
              min: 1
            }
          ],
          inputsInline: true,
          previousStatement: null,
          nextStatement: null,
          colour: 230,
          tooltip: 'play sound',
          helpUrl: ''
        });
      }
    };

    Blockly.Blocks['when_run'] = {
      init: function() {
        this.jsonInit({
          type: 'when_run',
          message0: 'when run',
          inputsInline: true,
          //"previousStatement": null,
          //"nextStatement": true,
          nextStatement: null,
          colour: 230,
          tooltip: 'play sound',
          helpUrl: ''
        });
      }
    };

    Blockly.JavaScript.when_run = function() {
      // Generate JavaScript for handling click event.
      return '\n';
    };

    Blockly.JavaScript.play_sound = function(ctx) {
      return (
        'Music.play_sound("' +
        ctx.getFieldValue('sound') +
        '", ' +
        ctx.getFieldValue('measure') +
        ');\n'
      );
    };

    //Blockly.inject(div, utils.extend(defaults, options), Sounds.getSingleton());
    const container = document.getElementById('blocklyDiv');

    this.workspace = Blockly.inject(container, {
      toolbox: toolbox,
      horizontalLayout: true
    });

    const xml = parseXmlElement(
      '<xml><block type="when_run" deletable="false" x="20" y="20"></block></xml>'
    );
    Blockly.Xml.domToBlockSpace(Blockly.mainBlockSpace, xml);
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
  };

  choosePanel = panel => {
    this.setState({currentPanel: panel});

    const currentAudioTime = GetCurrentAudioTime();

    if (panel == 'timeline') {
      /*
      const generator = GoogleBlockly.Generator.blockSpaceToCode.bind(
        GoogleBlockly.Blockly.Generator,
        'JavaScript'
      );
      */
      //var code = Blockly.JavaScript.workspaceToCode(Blockly.mainBlockSpace);

      var generator = Blockly.Generator.blockSpaceToCode.bind(
        Blockly.Generator,
        'JavaScript'
      );

      const events = {
        whenRunButton: {code: generator('when_run')}
      };

      CustomMarshalingInterpreter.evalWithEvents(
        {Music: this.api},
        events
      ).hooks.forEach(hook => {
        console.log('hook', hook);
        hooks[hook.name] = hook.func;
        //Flappy[hook.name] = hook.func;
      });

      this.callUserGeneratedCode(hooks.whenRunButton);

      for (const songEvent of songData.events) {
        if (songEvent.type == 'play') {
          PlaySound(songEvent.id, '', currentAudioTime + songEvent.when);
        }
      }
      //PlaySound("baddie-seen", "", currentAudioTime + 0);
      //PlaySound("baddie-seen", "", currentAudioTime + 1);
      //PlaySound("baddie-seen", "", currentAudioTime + 2);

      this.setState({isPlaying: true, startPlayingAudioTime: currentAudioTime});
    }
  };

  setSamplePanel = panel => {
    this.setState({samplePanel: panel});
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

    // Specify a baseline font at a baseline width.
    const baselineFontSize = 18;
    const baselineAppWidth = 930;

    let containerWidth, containerHeight;

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

    // Calculate the height.
    containerHeight = containerWidth / aspectRatio;

    // The tutorial shows 18px fonts when 930px wide.
    const baseFontSize = (baselineFontSize * containerWidth) / baselineAppWidth;

    const filenameToImgUrl = {
      samplepack1: require('@cdo/static/music/samplepack1.png'),
      samplepack2: require('@cdo/static/music/samplepack2.png'),
      samplepack3: require('@cdo/static/music/samplepack3.png'),
      samplepack4: require('@cdo/static/music/samplepack4.png'),
      samplepack5: require('@cdo/static/music/samplepack5.png'),
      samplepack6: require('@cdo/static/music/samplepack6.png'),
      samplepack7: require('@cdo/static/music/samplepack7.png'),
      waveform: require('@cdo/static/music/waveform-temp.png')
    };

    const mobileWidth = 500;
    const isDesktop = this.state.windowWidth >= mobileWidth;

    const showSamplePacks =
      isDesktop || this.state.currentPanel === 'samplepacks';
    const showCode = isDesktop || this.state.currentPanel === 'code';
    const showTimeline = isDesktop || this.state.currentPanel === 'timeline';
    const showLiveplay = isDesktop || this.state.currentPanel === 'liveplay';

    const currentPanel = this.state.currentPanel;

    const playHeadOffset = this.state.isPlaying
      ? (this.state.currentAudioTime - this.state.startPlayingAudioTime) * 100
      : null;

    return (
      <div
        style={{
          position: 'relative',
          backgroundColor: 'black',
          color: 'white',
          width: '100%',
          height: 'calc(100% - 90px)',
          borderRadius: 4,
          padding: 0,
          boxSizing: 'border-box'
        }}
      >
        {showTimeline && (
          <div
            style={{
              backgroundColor: '#222',
              height: 100,
              width: '100%',
              borderRadius: 4
            }}
          >
            Timeline
            <br />
            <br />
            <div
              style={{
                width: '100%',
                overflow: 'scroll',
                height: 50,
                position: 'relative'
              }}
            >
              <div style={{width: 900}}>
                {songData.events.map((eventData, index) => {
                  return (
                    <div
                      key={index}
                      style={{
                        width: 100,
                        borderLeft: '1px white solid',
                        position: 'absolute',
                        left: 100 * eventData.when
                      }}
                    >
                      <img
                        src={filenameToImgUrl['waveform']}
                        style={{width: 90, paddingRight: 20}}
                      />
                    </div>
                  );
                })}
              </div>

              <div style={{width: 900, position: 'absolute', top: 0, left: 0}}>
                {playHeadOffset !== null && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: playHeadOffset,
                      width: 1,
                      height: 40,
                      borderLeft: '3px yellow solid'
                    }}
                  >
                    &nbsp;
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {showSamplePacks && (
          <div
            style={{
              backgroundColor: '#222',
              float: 'left',
              width: isDesktop ? '40%' : '100%',
              height: 'calc(100% - 170px)',
              borderRadius: 4,
              marginTop: 10
            }}
          >
            {this.state.samplePanel == 'main' && (
              <div>
                <div>Sample packs</div>
                <br />
                <div
                  style={{cursor: 'pointer'}}
                  onClick={() => this.setSamplePanel('detail')}
                >
                  <img
                    src={filenameToImgUrl['samplepack1']}
                    style={{width: 60, paddingRight: 20}}
                  />
                  hip hop
                </div>
                <div>
                  <img
                    src={filenameToImgUrl['samplepack2']}
                    style={{width: 60, paddingRight: 20}}
                  />
                  rock
                </div>
                <div>
                  <img
                    src={filenameToImgUrl['samplepack3']}
                    style={{width: 60, paddingRight: 20}}
                  />
                  electronic
                </div>
                <div>
                  <img
                    src={filenameToImgUrl['samplepack4']}
                    style={{width: 60, paddingRight: 20}}
                  />
                  country
                </div>
                <div>
                  <img
                    src={filenameToImgUrl['samplepack5']}
                    style={{width: 60, paddingRight: 20}}
                  />
                  hip hop
                </div>
                <div>
                  <img
                    src={filenameToImgUrl['samplepack6']}
                    style={{width: 60, paddingRight: 20}}
                  />
                  r &amp; b
                </div>
                <div>
                  <img
                    src={filenameToImgUrl['samplepack7']}
                    style={{width: 60, paddingRight: 20}}
                  />
                  dance
                </div>
              </div>
            )}
            {this.state.samplePanel == 'detail' && (
              <div>
                <div
                  style={{cursor: 'pointer'}}
                  onClick={() => this.setSamplePanel('main')}
                >
                  &lt; Back
                </div>
                <br />
                <div>Hip hop sample pack</div>
                <br />
                <div>
                  <img
                    src={filenameToImgUrl['waveform']}
                    style={{width: 90, paddingRight: 20}}
                  />
                  Drum loop
                </div>
                <div>
                  <img
                    src={filenameToImgUrl['waveform']}
                    style={{width: 90, paddingRight: 20}}
                  />
                  Vocals
                </div>
                <div>
                  <img
                    src={filenameToImgUrl['waveform']}
                    style={{width: 90, paddingRight: 20}}
                  />
                  Main tune
                </div>
              </div>
            )}
          </div>
        )}
        <div
          id="blocklyDiv"
          style={{
            float: 'left',
            width: isDesktop ? '60%' : '100%',
            marginTop: 10,
            height: showCode ? 450 : 0
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            backgroundColor: '#222',
            height: 50,
            width: '100%',
            borderRadius: 4,
            marginTop: 10,
            justifyContent: 'space-evenly',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <div
            style={{
              textAlign: 'center',
              cursor: 'pointer',
              color: currentPanel == 'samplepacks' ? 'white' : '#777'
            }}
            onClick={() => this.choosePanel('samplepacks')}
          >
            <FontAwesome icon="book" style={{fontSize: 25}} />
            <div style={{fontSize: 8}}>Sample packs</div>
          </div>
          <div
            style={{
              textAlign: 'center',
              cursor: 'pointer',
              color: currentPanel == 'code' ? 'white' : '#777'
            }}
            onClick={() => this.choosePanel('code')}
          >
            <FontAwesome icon="music" style={{fontSize: 25}} />
            <div style={{fontSize: 8}}>Code song</div>
          </div>
          <div
            style={{
              textAlign: 'center',
              cursor: 'pointer',
              color: currentPanel == 'timeline' ? 'white' : '#777'
            }}
            onClick={() => this.choosePanel('timeline')}
          >
            <FontAwesome icon="play" style={{fontSize: 25}} />
            <div style={{fontSize: 8}}>Play song</div>
          </div>
          <div
            style={{
              textAlign: 'center',
              cursor: 'pointer',
              color: currentPanel == 'liveplay' ? 'white' : '#777'
            }}
            onClick={() => this.choosePanel('liveplay')}
          >
            <FontAwesome icon="th" style={{fontSize: 25}} />
            <div style={{fontSize: 8}}>Live play</div>
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    position: 'relative',
    margin: '0 auto',
    userSelect: 'none'
  },
  containerReact: {
    position: 'absolute',
    width: '100%',
    margin: '0 auto',
    userSelect: 'none',
    fontFamily: '"Gotham 4r", arial, sans-serif',
    color: 'rgb(30,30,30)',
    lineHeight: 1.3
  },
  backgroundCanvas: {
    position: 'absolute',
    left: 0,
    width: '100%',
    zIndex: -1,
    borderRadius: '10px'
  },
  activityCanvas: {
    width: '100%',
    borderRadius: '10px',
    border: 'none'
  }
};

export default connect(state => ({
  isProjectLevel: state.pageConstants.isProjectLevel,
  isReadOnlyWorkspace: state.pageConstants.isReadOnlyWorkspace
}))(MusicView);
