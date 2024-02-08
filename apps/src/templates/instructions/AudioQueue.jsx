import React, {createContext, useState, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {playNextAudio} from '../utils/audioQueueUtils';

export const AudioQueueContext = createContext();

export const AudioQueue = ({children}) => {
  const [audioQueue, setAudioQueue] = useState([]);
  const isPlaying = useRef(false);

  useEffect(() => {
    if (!isPlaying.current) {
      playNextAudio(audioQueue, isPlaying);
    }
  }, [audioQueue]);

  return (
    <AudioQueueContext.Provider value={{audioQueue, isPlaying, setAudioQueue}}>
      {children}
    </AudioQueueContext.Provider>
  );
};

AudioQueue.propTypes = {
  children: PropTypes.node.isRequired,
};
