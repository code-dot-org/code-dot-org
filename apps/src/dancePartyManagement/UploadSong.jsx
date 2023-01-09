import React, {useEffect, useState, useRef} from 'react';
import WaveSurfer from 'wavesurfer.js';
import MarkersPlugin from 'wavesurfer.js/src/plugin/markers';
import TimelinePlugin from 'wavesurfer.js/src/plugin/timeline';

const VISUALIZATION_ID = 'waveform-visualization';
const TIMELINE_ID = 'timeline';

const UploadSong = () => {
  const wavesurferRef = useRef();

  useEffect(() => {
    wavesurferRef.current = WaveSurfer.create({
      container: '#' + VISUALIZATION_ID,
      normalize: true,
      plugins: [
        MarkersPlugin.create({})
        // TimelinePlugin.create({
        //   container: '#' + TIMELINE_ID,
        //   offset: delay,
        //   timeInterval: pxPerSec => {
        //     return 60 / bpm;
        //   },
        //   primaryLabelInterval: pxPerSec => {
        //     return 4;
        //   },
        //   secondaryLabelInterval: pxPerSec => {
        //     return 1;
        //   }
        // })
        // WaveSurfer.cursor.create({
        //   showTime: true,
        //   opacity: 1,
        //   customShowTimeStyle: {
        //     'background-color': '#000',
        //     color: '#fff',
        //     padding: '2px',
        //     'font-size': '10px'
        //   }
        // })
      ]
    });
    wavesurferRef.current.load('/blockly/media/breakmysoul_beyonce.mp3');
    wavesurferRef.current.on('ready', () => setAudioReady(true));
    // wavesurferRef.current.on('seek', () => {
    //   setDelay(wavesurferRef.current.getCurrentTime().toFixed(2));
    //   console.log(`Current time: ${wavesurferRef.current.getCurrentTime()}`);
    // });
  }, []);

  const [isAudioReady, setAudioReady] = useState(false);
  const [delay, setDelay] = useState(0);
  const [bpm, setBpm] = useState(120);

  const playPause = () => {
    if (!isAudioReady) {
      return;
    }

    if (wavesurferRef.current.isPlaying()) {
      wavesurferRef.current.pause();
    } else {
      // wavesurferRef.current.seekTo(delay / wavesurferRef.current.getDuration());
      wavesurferRef.current.play();
    }
  };

  const setDelayMarker = () => {
    if (!isAudioReady) {
      return;
    }

    wavesurferRef.current.markers.clear();
    wavesurferRef.current.markers.add({
      time: wavesurferRef.current.getCurrentTime(),
      label: 'First Beat'
    });

    setDelay(wavesurferRef.current.getCurrentTime().toFixed(2));
  };

  const onBpmInput = e => {
    setBpm(e.target.value);
  };

  return (
    <div>
      <h1>Dance Party Song Tools</h1>
      <p>What up I am Dean</p>
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <p>{`Delay offset: ${delay} seconds`}</p>
        <label for="bpm-input">{`BPM: ${bpm}`}</label>
        <input
          type="text"
          id="bpm-input"
          name="bpm-input"
          onChange={onBpmInput}
        />
      </div>
      <div id={VISUALIZATION_ID} />
      <div id={TIMELINE_ID} />
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <button disabled={!isAudioReady} onClick={setDelayMarker}>
          Set Delay
        </button>
        <button disabled={!isAudioReady} onClick={playPause}>
          Play/Pause
        </button>
      </div>
    </div>
  );
};

export default UploadSong;
